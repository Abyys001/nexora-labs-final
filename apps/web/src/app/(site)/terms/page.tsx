import { LegalPage } from "@/components/sections/legal-page"
import { pageMetadata } from "@/lib/seo"

export const metadata = pageMetadata({ title: "Terms & Conditions", description: "Terms governing the use of the Cybercina website.", path: "/terms" })

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      path="/terms"
      updated="26 September 2026"
      intro="The terms that apply when you use this website."
      sections={[
        { heading: "About these terms", paragraphs: ["By using this website you agree to these terms. Project work is governed by a separate written agreement, which takes precedence over anything on this website."] },
        { heading: "Website content", paragraphs: ["Content on this website is provided for general information. Example projects and sample articles are illustrative and are labelled as such.", "Prices shown are indicative ranges, not offers or fixed quotes. Final pricing is confirmed in a written proposal."] },
        { heading: "Intellectual property", paragraphs: ["The design and content of this website belong to us or our licensors. You may not reproduce them for commercial purposes without permission."] },
        { heading: "Acceptable use", paragraphs: ["You must not misuse this website, including by attempting to gain unauthorised access, submitting false information or interfering with its operation."] },
        { heading: "Liability", paragraphs: ["We make reasonable efforts to keep this website accurate and available but do not guarantee it will always be complete, current or uninterrupted. Nothing in these terms excludes liability that cannot be excluded by law."] },
        { heading: "Governing law", paragraphs: ["These terms are governed by the laws of England and Wales."] },
      ]}
    />
  )
}
