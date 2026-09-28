import { createHmac } from "node:crypto";
import request from "supertest";
import { createPublishedRequest } from "./commercial-fixtures.js";
import { loginAsAdmin, startTestServer, type TestServer } from "./setup-app.js";

const WEBHOOK_SECRET = "whsec_test_secret_for_e2e";

function sign(rawBody: string, secret: string, timestamp = Math.floor(Date.now() / 1000)): string {
  const signature = createHmac("sha256", secret).update(`${timestamp}.${rawBody}`).digest("hex");
  return `t=${timestamp},v1=${signature}`;
}

describe("stripe webhook", () => {
  let server: TestServer;
  let accessToken: string;

  beforeAll(async () => {
    server = await startTestServer({ STRIPE_SECRET_KEY: "sk_test_dummy", STRIPE_WEBHOOK_SECRET: WEBHOOK_SECRET });
    accessToken = await loginAsAdmin(server);
  });

  afterAll(async () => {
    await server.stop();
  });

  async function createFullPlan() {
    const published = await createPublishedRequest(server, accessToken);
    const plan = await request(server.baseUrl).post(`/api/public/requests/${published.accessToken}/payment-plan`).send({ plan: "full" });
    return { ...published, scheduleItemId: plan.body.items[0].id as string, amountGbp: plan.body.items[0].amountGbp as number };
  }

  it("rejects an invalid signature", async () => {
    const body = JSON.stringify({ type: "checkout.session.completed", data: { object: {} } });
    const res = await request(server.baseUrl)
      .post("/api/webhooks/stripe")
      .set("Content-Type", "application/json")
      .set("Stripe-Signature", sign(body, "wrong-secret"))
      .send(body);
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("INVALID_SIGNATURE");
  });

  it("records a succeeded payment for checkout.session.completed with a valid signature", async () => {
    const { scheduleItemId, amountGbp, accessToken: token } = await createFullPlan();
    const body = JSON.stringify({
      type: "checkout.session.completed",
      data: { object: { metadata: { scheduleItemId }, payment_intent: "pi_test_001", amount_total: amountGbp * 100 } },
    });

    const res = await request(server.baseUrl)
      .post("/api/webhooks/stripe")
      .set("Content-Type", "application/json")
      .set("Stripe-Signature", sign(body, WEBHOOK_SECRET))
      .send(body);
    expect(res.status).toBe(200);

    const view = await request(server.baseUrl).get(`/api/public/requests/${token}`);
    expect(view.body.paymentPlan.items[0].status).toBe("paid");
  });

  it("is idempotent on the Stripe payment_intent id — replays do not double-count", async () => {
    const published = await createFullPlan();
    const { scheduleItemId, amountGbp } = published;
    const body = JSON.stringify({
      type: "checkout.session.completed",
      data: { object: { metadata: { scheduleItemId }, payment_intent: "pi_test_002", amount_total: amountGbp * 100 } },
    });

    for (let i = 0; i < 2; i++) {
      const res = await request(server.baseUrl)
        .post("/api/webhooks/stripe")
        .set("Content-Type", "application/json")
        .set("Stripe-Signature", sign(body, WEBHOOK_SECRET))
        .send(body);
      expect(res.status).toBe(200);
    }

    const payments = await request(server.baseUrl).get("/api/admin/payments").set("Authorization", `Bearer ${accessToken}`);
    const summary = payments.body.find((p: { proposalId: string }) => p.proposalId === published.proposalId);
    // A double-count would make paidGbp exceed the total — assert it lands exactly on amountGbp.
    expect(summary.paidGbp).toBe(amountGbp);
    expect(summary.status).toBe("paid");
  });
});
