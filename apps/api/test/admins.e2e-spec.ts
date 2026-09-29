import request from "supertest";
import { loginAsAdmin, startTestServer, type TestServer } from "./setup-app.js";

describe("admins", () => {
  let server: TestServer;
  let ownerToken: string;
  let ownerId: string;

  beforeAll(async () => {
    server = await startTestServer();
    ownerToken = await loginAsAdmin(server);
    const me = await request(server.baseUrl).get("/api/auth/me").set("Authorization", `Bearer ${ownerToken}`);
    ownerId = me.body.id;
  });

  afterAll(async () => {
    await server.stop();
  });

  it("creates admins with a role and lists them", async () => {
    const created = await request(server.baseUrl)
      .post("/api/admin/admins")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ email: "manager@cybercina.test", name: "Manager", role: "manager", password: "manager-password-123" });
    expect(created.status).toBe(201);
    expect(created.body.role).toBe("manager");
    expect(created.body).not.toHaveProperty("passwordHash");

    const list = await request(server.baseUrl).get("/api/admin/admins").set("Authorization", `Bearer ${ownerToken}`);
    expect(list.status).toBe(200);
    expect(list.body.some((a: { email: string }) => a.email === "manager@cybercina.test")).toBe(true);
  });

  it("cannot demote the last owner", async () => {
    const res = await request(server.baseUrl)
      .patch(`/api/admin/admins/${ownerId}`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ role: "manager" });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("CONFLICT");
  });

  it("can demote an owner once a second owner exists", async () => {
    const secondOwner = await request(server.baseUrl)
      .post("/api/admin/admins")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ email: "second-owner@cybercina.test", name: "Second Owner", role: "owner", password: "owner-password-123" });
    expect(secondOwner.status).toBe(201);

    const res = await request(server.baseUrl)
      .patch(`/api/admin/admins/${ownerId}`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ role: "manager" });
    expect(res.status).toBe(200);
    expect(res.body.role).toBe("manager");
  });

  it("non-owner roles cannot manage admins", async () => {
    const login = await request(server.baseUrl).post("/api/auth/login").send({ email: "manager@cybercina.test", password: "manager-password-123" });
    const res = await request(server.baseUrl)
      .get("/api/admin/admins")
      .set("Authorization", `Bearer ${login.body.accessToken}`);
    expect(res.status).toBe(403);
  });
});
