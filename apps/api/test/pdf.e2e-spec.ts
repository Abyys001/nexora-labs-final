import request from "supertest";
import { createPublishedRequest } from "./commercial-fixtures.js";
import { loginAsAdmin, startTestServer, type TestServer } from "./setup-app.js";

describe("proposal PDF", () => {
  let server: TestServer;
  let accessToken: string;

  beforeAll(async () => {
    server = await startTestServer();
    accessToken = await loginAsAdmin(server);
  });

  afterAll(async () => {
    await server.stop();
  });

  it("returns a valid application/pdf for the public request token", async () => {
    const published = await createPublishedRequest(server, accessToken);
    const res = await request(server.baseUrl).get(`/api/public/requests/${published.accessToken}/proposal.pdf`).buffer(true).parse((response, cb) => {
      const chunks: Buffer[] = [];
      response.on("data", (chunk: Buffer) => chunks.push(chunk));
      response.on("end", () => cb(null, Buffer.concat(chunks)));
    });

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toBe("application/pdf");
    expect((res.body as Buffer).subarray(0, 5).toString("utf8")).toBe("%PDF-");
  });

  it("returns the same PDF for the admin route", async () => {
    const published = await createPublishedRequest(server, accessToken);
    const res = await request(server.baseUrl)
      .get(`/api/admin/proposals/${published.proposalId}/pdf`)
      .set("Authorization", `Bearer ${accessToken}`)
      .buffer(true)
      .parse((response, cb) => {
        const chunks: Buffer[] = [];
        response.on("data", (chunk: Buffer) => chunks.push(chunk));
        response.on("end", () => cb(null, Buffer.concat(chunks)));
      });

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toBe("application/pdf");
    expect((res.body as Buffer).subarray(0, 5).toString("utf8")).toBe("%PDF-");
  });
});
