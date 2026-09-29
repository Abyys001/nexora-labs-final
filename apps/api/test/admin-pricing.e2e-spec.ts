import request from "supertest";
import { loginAsAdmin, startTestServer, type TestServer } from "./setup-app.js";

describe("admin pricing", () => {
  let server: TestServer;
  let ownerToken: string;

  beforeAll(async () => {
    server = await startTestServer();
    ownerToken = await loginAsAdmin(server);
  });

  afterAll(async () => {
    await server.stop();
  });

  function authed(token: string) {
    return {
      get: (url: string) => request(server.baseUrl).get(url).set("Authorization", `Bearer ${token}`),
      post: (url: string) => request(server.baseUrl).post(url).set("Authorization", `Bearer ${token}`),
      put: (url: string) => request(server.baseUrl).put(url).set("Authorization", `Bearer ${token}`),
    };
  }

  it("creates a pricing item and reads it back", async () => {
    const created = await authed(ownerToken)
      .post("/api/admin/pricing/items")
      .send({
        id: "custom-widget",
        kind: "feature",
        categoryId: "commerce",
        label: "Custom Widget",
        blurb: "A bespoke widget.",
        icon: "Package",
        price: 1200,
        complexity: "m",
      });
    expect(created.status).toBe(201);
    expect(created.body.price).toBe(1200);

    const fetched = await authed(ownerToken).get(`/api/admin/pricing/items/${created.body.id}`);
    expect(fetched.status).toBe(200);
    expect(fetched.body.itemId).toBe("custom-widget");
  });

  it("rejects a duplicate item id with 409", async () => {
    const res = await authed(ownerToken)
      .post("/api/admin/pricing/items")
      .send({ id: "custom-widget", kind: "feature", categoryId: "commerce", label: "Dup", icon: "Package", price: 100, complexity: "s" });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("CONFLICT");
  });

  it("updates an item's price and reflects it in the public catalogue", async () => {
    const created = await authed(ownerToken)
      .post("/api/admin/pricing/items")
      .send({ id: "another-widget", kind: "feature", categoryId: "commerce", label: "Another Widget", icon: "Package", price: 500, complexity: "s" });

    const updated = await authed(ownerToken).put(`/api/admin/pricing/items/${created.body.id}`).send({ price: 750 });
    expect(updated.status).toBe(200);
    expect(updated.body.price).toBe(750);

    const catalog = await request(server.baseUrl).get("/api/public/pricing");
    const item = catalog.body.catalog.items.find((i: { id: string }) => i.id === "another-widget");
    expect(item.price).toBe(750);
  });

  it("updates pricing settings", async () => {
    const settings = await authed(ownerToken).get("/api/admin/pricing/settings");
    expect(settings.status).toBe(200);

    const updated = await authed(ownerToken)
      .put("/api/admin/pricing/settings")
      .send({ additionalSolutionFactor: 0.5, rangeLow: 0.9, rangeHigh: 1.2, roundTo: 500 });
    expect(updated.status).toBe(200);
    expect(updated.body.roundTo).toBe(500);
  });

  it("403s a viewer attempting a write", async () => {
    const created = await authed(ownerToken)
      .post("/api/admin/admins")
      .send({ email: "viewer@cybercina.test", name: "Viewer", role: "viewer", password: "viewer-password-123" });
    expect(created.status).toBe(201);

    const login = await request(server.baseUrl).post("/api/auth/login").send({ email: "viewer@cybercina.test", password: "viewer-password-123" });
    const viewerToken = login.body.accessToken as string;

    const readOk = await authed(viewerToken).get("/api/admin/pricing/settings");
    expect(readOk.status).toBe(200);

    const writeForbidden = await authed(viewerToken).put("/api/admin/pricing/settings").send({ additionalSolutionFactor: 0.5, rangeLow: 0.9, rangeHigh: 1.2, roundTo: 250 });
    expect(writeForbidden.status).toBe(403);
    expect(writeForbidden.body.error.code).toBe("FORBIDDEN");
  });
});
