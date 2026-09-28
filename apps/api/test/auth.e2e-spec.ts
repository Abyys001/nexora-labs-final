import request from "supertest";
import { startTestServer, TEST_ADMIN, type TestServer } from "./setup-app.js";

describe("auth", () => {
  let server: TestServer;

  beforeAll(async () => {
    server = await startTestServer();
  });

  afterAll(async () => {
    await server.stop();
  });

  it("rejects admin routes without a token", async () => {
    const list = await request(server.baseUrl).get("/api/admin/enquiries");
    expect(list.status).toBe(401);
    expect(list.body.error.code).toBe("UNAUTHORIZED");

    const me = await request(server.baseUrl).get("/api/auth/me");
    expect(me.status).toBe(401);
    expect(me.body.error.code).toBe("UNAUTHORIZED");
  });

  it("logs in with the seeded admin", async () => {
    const res = await request(server.baseUrl)
      .post("/api/auth/login")
      .send({ email: TEST_ADMIN.email, password: TEST_ADMIN.password });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      accessToken: expect.any(String),
      expiresIn: 28800,
      admin: { id: expect.any(String), email: TEST_ADMIN.email, name: TEST_ADMIN.name, role: "owner" },
    });

    const me = await request(server.baseUrl)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${res.body.accessToken}`);
    expect(me.status).toBe(200);
    expect(me.body).toEqual({ id: expect.any(String), email: TEST_ADMIN.email, name: TEST_ADMIN.name, role: "owner" });
  });

  it("fails to log in with a bad password", async () => {
    const res = await request(server.baseUrl)
      .post("/api/auth/login")
      .send({ email: TEST_ADMIN.email, password: "wrong-password" });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });
});
