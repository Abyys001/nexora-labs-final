import request from "supertest";
import type { TestServer } from "./setup-app.js";

export function validProjectRequestPayload(overrides: Record<string, unknown> = {}) {
  return {
    contact: { name: "Grace Hopper", email: "grace@example.com", company: "Acme Ltd" },
    selection: {
      solutionTypes: ["web-app"],
      features: ["customer-accounts"],
      platforms: ["web"],
      integrations: [],
      ai: [],
      design: [],
      complexity: "standard",
      timeline: "flexible",
      userScale: "under-100",
    },
    details: { goals: ["more-leads"], industries: ["sme"] },
    currency: "GBP",
    ...overrides,
  };
}

export interface PublishedRequest {
  reference: string;
  accessToken: string;
  enquiryId: string;
  finalPriceGbp: number;
  proposalId: string;
}

/** Submits a project request, sets a final price, drafts and publishes a proposal. Ready for a payment plan. */
export async function createPublishedRequest(server: TestServer, accessToken: string): Promise<PublishedRequest> {
  const submit = await request(server.baseUrl).post("/api/project-requests").send(validProjectRequestPayload());
  const reference = submit.body.reference as string;
  const token = submit.body.accessToken as string;

  const list = await request(server.baseUrl)
    .get("/api/admin/enquiries")
    .set("Authorization", `Bearer ${accessToken}`)
    .query({ q: reference, pageSize: 5 });
  const enquiryId = list.body.items[0].id as string;

  const finalPriceGbp = submit.body.estimate.total as number;
  await request(server.baseUrl)
    .post(`/api/admin/enquiries/${enquiryId}/final-price`)
    .set("Authorization", `Bearer ${accessToken}`)
    .send({ mode: "accept", reason: "Matches the automated estimate" });

  const draft = await request(server.baseUrl)
    .post(`/api/admin/enquiries/${enquiryId}/proposals`)
    .set("Authorization", `Bearer ${accessToken}`)
    .send({
      content: {
        summary: "A web application project.",
        requirements: ["Customer accounts"],
        scope: [{ title: "Phase 1", body: "Build the core application." }],
        assumptions: ["Client supplies content"],
        exclusions: ["Ongoing marketing"],
        nextSteps: ["Kick-off call"],
      },
    });
  const proposalId = draft.body.id as string;

  await request(server.baseUrl).post(`/api/admin/proposals/${proposalId}/publish`).set("Authorization", `Bearer ${accessToken}`);

  return { reference, accessToken: token, enquiryId, finalPriceGbp, proposalId };
}
