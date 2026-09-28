import { randomUUID } from "node:crypto";
import request from "supertest";
import { loginAsAdmin, startTestServer, type TestServer } from "./setup-app.js";
import { validEnquiryPayload } from "./fixtures.js";

interface Fixture {
  source: "contact" | "quote";
  name: string;
  email: string;
  company: string;
  patchStatus?: "contacted" | "qualified" | "won";
}

const FIXTURES: Fixture[] = [
  { source: "contact", name: "Alice Smith", email: "alice@acme.com", company: "Acme" },
  { source: "contact", name: "Bob Jones", email: "bob@beta.com", company: "Beta", patchStatus: "contacted" },
  { source: "quote", name: "Carol White", email: "carol@acme.com", company: "Acme Labs" },
  { source: "quote", name: "Dave Black", email: "dave@gamma.com", company: "Gamma", patchStatus: "qualified" },
  { source: "contact", name: "Eve Green", email: "eve@acme.com", company: "Acme", patchStatus: "won" },
];

describe("admin enquiries", () => {
  let server: TestServer;
  let accessToken: string;
  let fixtureIds: string[];

  beforeAll(async () => {
    server = await startTestServer();
    accessToken = await loginAsAdmin(server);

    fixtureIds = [];
    for (const fixture of FIXTURES) {
      const created = await request(server.baseUrl)
        .post("/api/enquiries")
        .send(validEnquiryPayload(fixture));
      fixtureIds.push(created.body.id);

      if (fixture.patchStatus) {
        await request(server.baseUrl)
          .patch(`/api/admin/enquiries/${created.body.id}`)
          .set("Authorization", `Bearer ${accessToken}`)
          .send({ status: fixture.patchStatus });
      }
    }
  });

  afterAll(async () => {
    await server.stop();
  });

  function authed() {
    return request(server.baseUrl).get("/api/admin/enquiries").set("Authorization", `Bearer ${accessToken}`);
  }

  it("lists all enquiries newest first", async () => {
    const res = await authed().query({ pageSize: 20 });
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(5);
    expect(res.body.items).toHaveLength(5);
    expect(res.body.items[0].name).toBe("Eve Green");
    expect(res.body.items[4].name).toBe("Alice Smith");
    expect(res.body.items[0].ipHash).toBeUndefined();
  });

  it("filters by status", async () => {
    const res = await authed().query({ status: "new" });
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(2);
    expect(res.body.items.map((i: { name: string }) => i.name).sort()).toEqual(["Alice Smith", "Carol White"]);
  });

  it("filters by source", async () => {
    const res = await authed().query({ source: "quote" });
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(2);
    expect(res.body.items.map((i: { name: string }) => i.name).sort()).toEqual(["Carol White", "Dave Black"]);
  });

  it("searches by name/email/company case-insensitively", async () => {
    const res = await authed().query({ q: "acme" });
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(3);
    expect(res.body.items.map((i: { name: string }) => i.name).sort()).toEqual([
      "Alice Smith",
      "Carol White",
      "Eve Green",
    ]);
  });

  it("paginates results", async () => {
    const page1 = await authed().query({ pageSize: 2, page: 1 });
    expect(page1.body).toMatchObject({ total: 5, page: 1, pageSize: 2 });
    expect(page1.body.items).toHaveLength(2);

    const page3 = await authed().query({ pageSize: 2, page: 3 });
    expect(page3.body).toMatchObject({ total: 5, page: 3, pageSize: 2 });
    expect(page3.body.items).toHaveLength(1);
  });

  it("updates status and notes via PATCH", async () => {
    const id = fixtureIds[0];
    const res = await request(server.baseUrl)
      .patch(`/api/admin/enquiries/${id}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ status: "contacted", notes: "Called, interested in a quote." });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("contacted");
    expect(res.body.notes).toBe("Called, interested in a quote.");
  });

  it("returns 404 for PATCH with an unknown id", async () => {
    const res = await request(server.baseUrl)
      .patch(`/api/admin/enquiries/${randomUUID()}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ status: "lost" });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("returns 404, not 500, for a malformed id", async () => {
    const res = await request(server.baseUrl)
      .get("/api/admin/enquiries/not-a-uuid")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });
});
