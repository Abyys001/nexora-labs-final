import request from "supertest";
import { createPublishedRequest } from "./commercial-fixtures.js";
import { loginAsAdmin, startTestServer, type TestServer } from "./setup-app.js";

describe("payments", () => {
  let server: TestServer;
  let accessToken: string;

  beforeAll(async () => {
    server = await startTestServer();
    accessToken = await loginAsAdmin(server);
  });

  afterAll(async () => {
    await server.stop();
  });

  it("rejects a split-completion secondDueDate outside [completion-14, completion+30]", async () => {
    const published = await createPublishedRequest(server, accessToken);
    const res = await request(server.baseUrl)
      .post(`/api/public/requests/${published.accessToken}/payment-plan`)
      .send({ plan: "split-completion", secondDueDate: "2000-01-01" });
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("UNPROCESSABLE");
  });

  it("rejects a split-development secondDueDate outside [acceptance+14, completion-7]", async () => {
    const published = await createPublishedRequest(server, accessToken);
    const tomorrow = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
    const res = await request(server.baseUrl)
      .post(`/api/public/requests/${published.accessToken}/payment-plan`)
      .send({ plan: "split-development", secondDueDate: tomorrow }); // only 1 day out, window starts at +14 days
    expect(res.status).toBe(422);
  });

  it("accepts a valid split-completion plan and produces two instalments summing to the total", async () => {
    const published = await createPublishedRequest(server, accessToken);
    const inRange = new Date(Date.now() + 200 * 86_400_000).toISOString().slice(0, 10); // comfortably inside the completion window for a 26-week timeline
    const res = await request(server.baseUrl)
      .post(`/api/public/requests/${published.accessToken}/payment-plan`)
      .send({ plan: "split-completion", secondDueDate: inRange });
    expect(res.status).toBe(201);
    expect(res.body.items).toHaveLength(2);
    const total = res.body.items.reduce((sum: number, i: { amountGbp: number }) => sum + i.amountGbp, 0);
    expect(total).toBe(published.finalPriceGbp);
  });

  it("ledger writes move a schedule item from awaiting to partially-paid to paid", async () => {
    const published = await createPublishedRequest(server, accessToken);
    const plan = await request(server.baseUrl).post(`/api/public/requests/${published.accessToken}/payment-plan`).send({ plan: "full" });
    const item = plan.body.items[0];
    expect(item.status).toBe("awaiting");

    const half = Math.floor(item.amountGbp / 2);
    const partial = await request(server.baseUrl)
      .post("/api/admin/payments")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ scheduleItemId: item.id, amountGbp: half, method: "bank-transfer" });
    expect(partial.status).toBe(201);

    const afterPartial = await request(server.baseUrl).get(`/api/public/requests/${published.accessToken}`);
    expect(afterPartial.body.paymentPlan.items[0].status).toBe("partially-paid");
    expect(afterPartial.body.paymentStatus).toBe("partially-paid");

    await request(server.baseUrl)
      .post("/api/admin/payments")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ scheduleItemId: item.id, amountGbp: item.amountGbp - half, method: "bank-transfer" });

    const afterFull = await request(server.baseUrl).get(`/api/public/requests/${published.accessToken}`);
    expect(afterFull.body.paymentPlan.items[0].status).toBe("paid");
    expect(afterFull.body.paymentStatus).toBe("paid");
  });

  it("viewer role cannot record a payment (403)", async () => {
    const created = await request(server.baseUrl)
      .post("/api/admin/admins")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ email: "payments-viewer@cybercina.test", name: "Viewer", role: "viewer", password: "viewer-password-123" });
    expect(created.status).toBe(201);
    const login = await request(server.baseUrl).post("/api/auth/login").send({ email: "payments-viewer@cybercina.test", password: "viewer-password-123" });

    const res = await request(server.baseUrl)
      .post("/api/admin/payments")
      .set("Authorization", `Bearer ${login.body.accessToken}`)
      .send({ scheduleItemId: "00000000-0000-0000-0000-000000000000", amountGbp: 1, method: "other" });
    expect(res.status).toBe(403);
  });
});
