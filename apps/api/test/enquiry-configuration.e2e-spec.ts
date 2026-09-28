import request from "supertest";
import { loginAsAdmin, startTestServer, type TestServer } from "./setup-app.js";
import { validEnquiryPayload } from "./fixtures.js";

describe("POST /api/enquiries — Project Builder configuration", () => {
  let server: TestServer;
  let accessToken: string;

  beforeAll(async () => {
    server = await startTestServer();
    accessToken = await loginAsAdmin(server);
  });

  afterAll(async () => {
    await server.stop();
  });

  it("returns 201 and stores a valid configuration", async () => {
    const configuration = {
      solutionTypes: ["web-app"],
      industries: ["retail"],
      goals: ["automate-workflow"],
      successCriteria: "Ship an MVP within 3 months",
      features: ["user-accounts", "payments"],
      platforms: ["web"],
      userScale: "1k-10k",
      stage: "prototype",
      estimate: { min: 10_000, max: 25_000, currency: "GBP" },
    };
    const res = await request(server.baseUrl)
      .post("/api/enquiries")
      .send(validEnquiryPayload({ email: "builder@example.com", configuration }));

    expect(res.status).toBe(201);

    const stored = await request(server.baseUrl)
      .get(`/api/admin/enquiries/${res.body.id}`)
      .set("Authorization", `Bearer ${accessToken}`);
    expect(stored.status).toBe(200);
    expect(stored.body.configuration).toEqual(configuration);
  });

  it("returns 400 when the estimate max is below min", async () => {
    const res = await request(server.baseUrl)
      .post("/api/enquiries")
      .send(
        validEnquiryPayload({
          email: "bad-estimate@example.com",
          configuration: {
            solutionTypes: ["web-app"],
            industries: [],
            goals: [],
            features: [],
            platforms: [],
            estimate: { min: 25_000, max: 10_000, currency: "GBP" },
          },
        }),
      );

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_FAILED");
  });

  it("returns 400 when there are no solution types", async () => {
    const res = await request(server.baseUrl)
      .post("/api/enquiries")
      .send(
        validEnquiryPayload({
          email: "no-solution-types@example.com",
          configuration: {
            solutionTypes: [],
            industries: [],
            goals: [],
            features: [],
            platforms: [],
            estimate: { min: 10_000, max: 25_000, currency: "GBP" },
          },
        }),
      );

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_FAILED");
  });
});
