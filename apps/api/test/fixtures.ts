function baseEnquiryPayload() {
  return {
    source: "contact" as const,
    name: "Ada Lovelace",
    email: "ada@example.com",
    projectType: "website" as const,
    budget: "5k-10k" as const,
    description: "We need a new marketing site with a blog and a contact form.",
  };
}

export function validEnquiryPayload<T extends object>(overrides: T = {} as T) {
  return { ...baseEnquiryPayload(), ...overrides };
}
