import request from "supertest";
import { startTestServer, type TestServer } from "./setup-app.js";
import { validEnquiryPayload } from "./fixtures.js";

describe("rate limiting", () => {
  let server: TestServer;

  beforeAll(async () => {
    server = await startTestServer();
  });

  afterAll(async () => {
    await server.stop();
  });

  it("returns 429 once the per-IP limit for POST /api/enquiries is exceeded", async () => {
    const limit = 5;
    const responses = [];
    for (let i = 0; i < limit + 1; i++) {
      responses.push(await request(server.baseUrl).post("/api/enquiries").send(validEnquiryPayload()));
    }

    const statuses = responses.map((res) => res.status);
    expect(statuses.slice(0, limit)).toEqual(Array(limit).fill(201));

    const throttled = responses[limit];
    expect(throttled.status).toBe(429);
    expect(throttled.body.error.code).toBe("RATE_LIMITED");
  });
});
