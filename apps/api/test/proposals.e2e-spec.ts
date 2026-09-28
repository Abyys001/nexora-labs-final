import http from "node:http";
import type { AddressInfo } from "node:net";
import request from "supertest";
import { validProjectRequestPayload } from "./commercial-fixtures.js";
import { loginAsAdmin, startTestServer, type TestServer } from "./setup-app.js";

describe("proposals", () => {
  let stubServer: http.Server;
  let stubUrl: string;
  let server: TestServer;
  let accessToken: string;

  beforeAll(async () => {
    stubServer = http.createServer((_req, res) => {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ rates: { EUR: 1.17, USD: 1.27 } }));
    });
    await new Promise<void>((resolve) => stubServer.listen(0, resolve));
    const address = stubServer.address() as AddressInfo;
    stubUrl = `http://127.0.0.1:${address.port}/latest`;

    server = await startTestServer({ FX_PROVIDER_URL: stubUrl });
    accessToken = await loginAsAdmin(server);
  });

  afterAll(async () => {
    await server.stop();
    await new Promise<void>((resolve) => stubServer.close(() => resolve()));
  });

  async function submitAndGetId() {
    const submit = await request(server.baseUrl).post("/api/project-requests").send(validProjectRequestPayload());
    const list = await request(server.baseUrl)
      .get("/api/admin/enquiries")
      .set("Authorization", `Bearer ${accessToken}`)
      .query({ q: submit.body.reference, pageSize: 5 });
    return { enquiryId: list.body.items[0].id as string, estimateGbp: submit.body.estimate.total as number };
  }

  it("writes a price_changes row and an audit log entry on final-price accept/adjust/manual", async () => {
    const { enquiryId, estimateGbp } = await submitAndGetId();

    const accept = await request(server.baseUrl)
      .post(`/api/admin/enquiries/${enquiryId}/final-price`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ mode: "accept", reason: "Matches estimate" });
    expect(accept.status).toBe(201);
    expect(accept.body.finalPriceGbp).toBe(estimateGbp);

    const adjust = await request(server.baseUrl)
      .post(`/api/admin/enquiries/${enquiryId}/final-price`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ mode: "adjust", deltaGbp: 500, reason: "Extra scope" });
    expect(adjust.body.finalPriceGbp).toBe(estimateGbp + 500);

    const manual = await request(server.baseUrl)
      .post(`/api/admin/enquiries/${enquiryId}/final-price`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ mode: "manual", amountGbp: 99999, reason: "Negotiated" });
    expect(manual.body.finalPriceGbp).toBe(99999);

    const detail = await request(server.baseUrl).get(`/api/admin/enquiries/${enquiryId}`).set("Authorization", `Bearer ${accessToken}`);
    expect(detail.body.priceChanges).toHaveLength(3);
    expect(detail.body.priceChanges[0].mode).toBe("manual");
    expect(detail.body.priceChanges[0].newGbp).toBe(99999);

    const audit = await request(server.baseUrl).get("/api/admin/audit-logs?entity=enquiry").set("Authorization", `Bearer ${accessToken}`);
    expect(audit.body.items.some((a: { action: string; entityId: string }) => a.action === "set_final_price" && a.entityId === enquiryId)).toBe(true);
  });

  it("publish snapshots the currency rate, and a later rate change does not alter the proposal", async () => {
    // EUR must be enabled (via a successful refresh) before a request can be submitted in that currency.
    await request(server.baseUrl).post("/api/admin/currencies/refresh").set("Authorization", `Bearer ${accessToken}`);

    const submitEur = await request(server.baseUrl).post("/api/project-requests").send(validProjectRequestPayload({ currency: "EUR" }));
    const listEur = await request(server.baseUrl)
      .get("/api/admin/enquiries")
      .set("Authorization", `Bearer ${accessToken}`)
      .query({ q: submitEur.body.reference, pageSize: 5 });
    const eurEnquiryId = listEur.body.items[0].id as string;
    await request(server.baseUrl)
      .post(`/api/admin/enquiries/${eurEnquiryId}/final-price`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ mode: "accept", reason: "ok" });

    const draft = await request(server.baseUrl)
      .post(`/api/admin/enquiries/${eurEnquiryId}/proposals`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ content: { summary: "s", requirements: [], scope: [], assumptions: [], exclusions: [], nextSteps: [] } });

    const published = await request(server.baseUrl).post(`/api/admin/proposals/${draft.body.id}/publish`).set("Authorization", `Bearer ${accessToken}`);
    expect(published.status).toBe(201);
    const rateAtPublish = published.body.exchangeRate as number;
    expect(rateAtPublish).toBeCloseTo(1.17);

    // Rate changes after publish must never alter the already-published proposal.
    await request(server.baseUrl)
      .put("/api/admin/currencies/EUR")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ rate: 2.5 });

    const refetched = await request(server.baseUrl).get(`/api/admin/proposals/${draft.body.id}`).set("Authorization", `Bearer ${accessToken}`);
    expect(refetched.body.exchangeRate).toBeCloseTo(rateAtPublish);
  });
});
