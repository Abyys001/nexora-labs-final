import http from "node:http";
import type { AddressInfo } from "node:net";
import request from "supertest";
import { loginAsAdmin, startTestServer, type TestServer } from "./setup-app.js";

describe("admin currencies", () => {
  let stubServer: http.Server;
  let stubUrl: string;
  let stubShouldFail = false;
  let stubRates = { EUR: 1.17, USD: 1.27 };

  let server: TestServer;
  let accessToken: string;

  beforeAll(async () => {
    stubServer = http.createServer((_req, res) => {
      if (stubShouldFail) {
        res.writeHead(500).end("provider down");
        return;
      }
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ amount: 1, base: "GBP", date: "2026-01-01", rates: stubRates }));
    });
    await new Promise<void>((resolve) => stubServer.listen(0, resolve));
    const address = stubServer.address() as AddressInfo;
    stubUrl = `http://127.0.0.1:${address.port}/latest?from=GBP&to=EUR,USD`;

    server = await startTestServer({ FX_PROVIDER_URL: stubUrl });
    accessToken = await loginAsAdmin(server);
  });

  afterAll(async () => {
    await server.stop();
    await new Promise<void>((resolve) => stubServer.close(() => resolve()));
  });

  function authed() {
    return request(server.baseUrl).get("/api/admin/currencies").set("Authorization", `Bearer ${accessToken}`);
  }

  it("refreshes rates from the provider", async () => {
    const refresh = await request(server.baseUrl).post("/api/admin/currencies/refresh").set("Authorization", `Bearer ${accessToken}`);
    expect(refresh.status).toBe(201);

    const list = await authed();
    const eur = list.body.find((c: { code: string }) => c.code === "EUR");
    expect(eur.rate).toBeCloseTo(1.17);
    expect(eur.enabled).toBe(true);
    expect(eur.source).toBe("provider");
  });

  it("a manual override is never overwritten by a later provider refresh", async () => {
    const manual = await request(server.baseUrl)
      .put("/api/admin/currencies/USD")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ rate: 1.5, enabled: true, rounding: 10 });
    expect(manual.status).toBe(200);
    expect(manual.body.source).toBe("manual");

    stubRates = { EUR: 1.2, USD: 1.99 };
    await request(server.baseUrl).post("/api/admin/currencies/refresh").set("Authorization", `Bearer ${accessToken}`);

    const list = await authed();
    const usd = list.body.find((c: { code: string }) => c.code === "USD");
    expect(usd.rate).toBeCloseTo(1.5);
    expect(usd.source).toBe("manual");
  });

  it("a failed refresh keeps the last good rate and records the error", async () => {
    stubShouldFail = true;
    await request(server.baseUrl).post("/api/admin/currencies/refresh").set("Authorization", `Bearer ${accessToken}`);
    stubShouldFail = false;

    const list = await authed();
    const eur = list.body.find((c: { code: string }) => c.code === "EUR");
    expect(eur.rate).toBeCloseTo(1.2); // unchanged from the last successful refresh
    expect(eur.lastRefreshError).toBeTruthy();
  });

  it("records history entries for both provider and manual rates", async () => {
    const history = await request(server.baseUrl).get("/api/admin/currencies/history").set("Authorization", `Bearer ${accessToken}`);
    expect(history.status).toBe(200);
    expect(history.body.some((h: { source: string }) => h.source === "provider")).toBe(true);
    expect(history.body.some((h: { source: string }) => h.source === "manual")).toBe(true);
  });
});
