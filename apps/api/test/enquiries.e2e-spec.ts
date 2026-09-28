import request from "supertest";
import { loginAsAdmin, startTestServer, type TestServer } from "./setup-app.js";
import { validEnquiryPayload } from "./fixtures.js";

describe("POST /api/enquiries", () => {
  let server: TestServer;
  let accessToken: string;

  beforeAll(async () => {
    server = await startTestServer();
    accessToken = await loginAsAdmin(server);
  });

  afterAll(async () => {
    await server.stop();
  });

  it("returns 201 and stores the row for a valid enquiry", async () => {
    const res = await request(server.baseUrl)
      .post("/api/enquiries")
      .send(validEnquiryPayload({ email: "ada@example.com" }));

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: expect.any(String) });

    const stored = await request(server.baseUrl)
      .get(`/api/admin/enquiries/${res.body.id}`)
      .set("Authorization", `Bearer ${accessToken}`);
    expect(stored.status).toBe(200);
    expect(stored.body.email).toBe("ada@example.com");
    expect(stored.body.status).toBe("new");
    expect(stored.body.ipHash).toBeUndefined();
  });

  it("returns 400 with the error envelope and fieldErrors for an invalid body", async () => {
    const res = await request(server.baseUrl)
      .post("/api/enquiries")
      .send(validEnquiryPayload({ email: "not-an-email", description: "too short" }));

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_FAILED");
    expect(res.body.error.details.fieldErrors.email).toBeDefined();
    expect(res.body.error.details.fieldErrors.description).toBeDefined();
  });

  it("returns 201 but stores nothing when the honeypot field is filled", async () => {
    const res = await request(server.baseUrl)
      .post("/api/enquiries")
      .send(validEnquiryPayload({ email: "bot@example.com", hp: "i-am-a-bot" }));

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: expect.any(String) });

    const notFound = await request(server.baseUrl)
      .get(`/api/admin/enquiries/${res.body.id}`)
      .set("Authorization", `Bearer ${accessToken}`);
    expect(notFound.status).toBe(404);

    const search = await request(server.baseUrl)
      .get("/api/admin/enquiries")
      .query({ q: "bot@example.com" })
      .set("Authorization", `Bearer ${accessToken}`);
    expect(search.body.total).toBe(0);
  });
});
