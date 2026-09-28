import request from "supertest";
import { validProjectRequestPayload } from "./commercial-fixtures.js";
import { startTestServer, type TestServer } from "./setup-app.js";

describe("project requests", () => {
  let server: TestServer;

  beforeAll(async () => {
    server = await startTestServer();
  });

  afterAll(async () => {
    await server.stop();
  });

  it("recomputes the estimate server-side and ignores any client-sent price", async () => {
    const res = await request(server.baseUrl)
      .post("/api/project-requests")
      .send(
        validProjectRequestPayload({
          // These should have zero effect — the server recomputes from the DB catalogue.
          estimate: { total: 1, lines: [], subtotal: 1, adjustments: [], range: { low: 1, high: 1 }, monthly: { support: 0, maintenance: 0 } },
          estimateGbp: 1,
          finalPriceGbp: 1,
        }),
      );

    expect(res.status).toBe(201);
    expect(res.body.estimate.total).toBeGreaterThan(1);
    expect(res.body).toHaveProperty("reference");
    expect(res.body).toHaveProperty("accessToken");
    expect(res.body.currency).toBe("GBP");
    expect(res.body.amountInCurrency).toBe(res.body.estimate.total);
  });

  it("allocates a NX-<year>-<0001-padded sequence> reference", async () => {
    const res = await request(server.baseUrl).post("/api/project-requests").send(validProjectRequestPayload());
    expect(res.status).toBe(201);
    expect(res.body.reference).toMatch(/^NX-\d{4}-\d{4}$/);
  });

  it("looks up the request by its access token", async () => {
    const submit = await request(server.baseUrl).post("/api/project-requests").send(validProjectRequestPayload());
    const token = submit.body.accessToken as string;

    const view = await request(server.baseUrl).get(`/api/public/requests/${token}`);
    expect(view.status).toBe(200);
    expect(view.body.reference).toBe(submit.body.reference);
    expect(view.body.stage).toBe("under-review");
    expect(view.body.proposal).toBeNull();
    expect(view.body.paymentStatus).toBe("not-started");
  });

  it("returns 404 for an unknown token", async () => {
    const res = await request(server.baseUrl).get("/api/public/requests/not-a-real-token");
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("returns 400 INVALID_JSON for a malformed request body", async () => {
    const res = await request(server.baseUrl)
      .post("/api/project-requests")
      .set("Content-Type", "application/json")
      .send("{not valid json");
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("INVALID_JSON");
  });

  it("honeypot hits return a plausible response without persisting anything", async () => {
    const res = await request(server.baseUrl)
      .post("/api/project-requests")
      .send(validProjectRequestPayload({ hp: "i-am-a-bot" }));
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("reference");

    const view = await request(server.baseUrl).get(`/api/public/requests/${res.body.accessToken}`);
    expect(view.status).toBe(404);
  });
});
