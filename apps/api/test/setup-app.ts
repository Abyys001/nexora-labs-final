import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import path from "node:path";
import request from "supertest";

export const TEST_ADMIN = {
  email: "admin@cybercina.test",
  password: "super-secret-password-123",
  name: "Test Admin",
};

export interface TestServer {
  baseUrl: string;
  stop: () => Promise<void>;
}

const apiRoot = path.resolve(__dirname, "..");
const mainJs = path.join(apiRoot, "dist", "main.js");
let nextPort = 4700;

/**
 * The app is ESM-only (Nest 12) and its CJS transitive deps require() it
 * back in ways that trip Node's require(esm)-in-a-cycle restriction when
 * loaded inside Jest. Running it as a real child process sidesteps that
 * entirely and is a more honest e2e test (real HTTP, real process boundary).
 */
export async function startTestServer(envOverrides: Record<string, string> = {}): Promise<TestServer> {
  const port = nextPort++;
  // Empty strings, like compose's `${SMTP_URL:-}` would pass, exercise the
  // real deployment shape rather than a vars-fully-unset shortcut.
  const env = {
    ...process.env,
    NODE_ENV: "test",
    DATABASE_URL: "pglite://memory",
    JWT_SECRET: "test-jwt-secret-that-is-at-least-32-characters-long",
    JWT_EXPIRES_IN_SECONDS: "28800",
    IP_HASH_SALT: "test-ip-salt",
    ADMIN_EMAIL: TEST_ADMIN.email,
    ADMIN_PASSWORD: TEST_ADMIN.password,
    ADMIN_NAME: TEST_ADMIN.name,
    CORS_ORIGIN: "http://localhost:3000",
    PORT: String(port),
    SMTP_URL: "",
    NOTIFY_EMAIL_TO: "",
    MAIL_FROM: "",
    PUBLIC_SITE_URL: "http://localhost:3000",
    FX_PROVIDER_URL: "",
    FX_REFRESH_HOURS: "12",
    STRIPE_SECRET_KEY: "",
    STRIPE_WEBHOOK_SECRET: "",
    PAYMENT_BANK_DETAILS: "",
    ...envOverrides,
  };

  const child = spawn(process.execPath, [mainJs], { cwd: apiRoot, env });
  if (process.env.API_TEST_LOGS) child.stdout.on("data", (c: Buffer) => process.stdout.write(c));
  if (process.env.API_TEST_LOGS) child.stderr.on("data", (c: Buffer) => process.stdout.write(c));

  const baseUrl = `http://127.0.0.1:${port}`;
  await waitUntilHealthy(baseUrl, child);

  return {
    baseUrl,
    stop: () =>
      new Promise<void>((resolve) => {
        child.once("exit", () => resolve());
        child.kill();
      }),
  };
}

export async function loginAsAdmin(server: TestServer): Promise<string> {
  const res = await request(server.baseUrl)
    .post("/api/auth/login")
    .send({ email: TEST_ADMIN.email, password: TEST_ADMIN.password });
  return res.body.accessToken as string;
}

function waitUntilHealthy(baseUrl: string, child: ChildProcessWithoutNullStreams): Promise<void> {
  return new Promise((resolve, reject) => {
    let settled = false;
    let stderr = "";
    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });
    child.once("exit", (code) => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        reject(new Error(`API process exited early with code ${code}\n${stderr}`));
      }
    });

    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        reject(new Error(`API did not become healthy in time\n${stderr}`));
      }
    }, 15000);

    const poll = async (): Promise<void> => {
      if (settled) return;
      try {
        const res = await fetch(`${baseUrl}/api/health`);
        if (res.ok) {
          settled = true;
          clearTimeout(timer);
          resolve();
          return;
        }
      } catch {
        // API not accepting connections yet.
      }
      setTimeout(poll, 200);
    };
    void poll();
  });
}
