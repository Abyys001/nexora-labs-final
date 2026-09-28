import { LegalPage } from "@/components/sections/legal-page"
import { site } from "@/content/site"
import { pageMetadata } from "@/lib/seo"

export const metadata = pageMetadata({ title: "Privacy Policy", description: "How Nexora Labs collects, uses and protects personal information.", path: "/privacy-policy" })

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      path="/privacy-policy"
      updated="26 September 2026"
      intro="How we collect, use and protect your personal information."
      sections={[
        { heading: "Who we are", paragraphs: [`${site.name} ("we", "us") is responsible for the personal information collected through this website. You can contact us at ${site.email}.`] },
        { heading: "Information we collect", paragraphs: ["When you submit an enquiry or quote request, we collect the details you provide, such as your name, email address, phone number, company and project information.", "We also record limited technical information, such as your browser type and a one-way hashed form of your IP address, to protect our forms from abuse. We do not store your raw IP address."] },
        { heading: "How we use your information", paragraphs: ["We use your information to respond to your enquiry, prepare proposals, deliver services you request and keep appropriate business records.", "We do not sell your personal information, and we do not use it for unrelated marketing without your consent."] },
        { heading: "Legal basis", paragraphs: ["We process enquiry data on the basis of our legitimate interest in responding to requests you make, and where applicable to take steps at your request before entering into a contract."] },
        { heading: "Retention", paragraphs: ["We keep enquiry information only for as long as needed to respond and for reasonable record-keeping, after which it is deleted or anonymised."] },
        { heading: "Sharing", paragraphs: ["We share information only with service providers that help us operate this website and our business (for example, hosting and email providers), under appropriate agreements."] },
        { heading: "Your rights", paragraphs: ["Depending on where you live, you may have rights to access, correct, delete or restrict the use of your personal information, and to complain to a data protection authority. In the UK, this is the Information Commissioner's Office (ICO).", `To exercise your rights, contact ${site.email}.`] },
      ]}
    />
  )
}
