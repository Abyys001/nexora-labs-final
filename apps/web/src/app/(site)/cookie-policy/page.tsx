import { LegalPage } from "@/components/sections/legal-page"
import { pageMetadata } from "@/lib/seo"

export const metadata = pageMetadata({ title: "Cookie Policy", description: "How the Cybercina website uses cookies.", path: "/cookie-policy" })

export default function CookiePolicyPage() {
  return (
    <LegalPage
      title="Cookie Policy"
      path="/cookie-policy"
      updated="26 September 2026"
      intro="How this website uses cookies and similar technologies."
      sections={[
        { heading: "Our approach", paragraphs: ["This website is designed to work without tracking or advertising cookies. The public pages do not set any non-essential cookies."] },
        { heading: "Strictly necessary cookies", paragraphs: ["A secure, HTTP-only session cookie is used only when authorised staff sign in to the administration area. It is essential for that area to work and is not used for tracking."] },
        { heading: "Analytics", paragraphs: ["If analytics are added in future, this policy will be updated and, where required, your consent will be requested before any non-essential cookies are set."] },
        { heading: "Managing cookies", paragraphs: ["You can control and delete cookies through your browser settings. Blocking strictly necessary cookies will only affect the administration area."] },
      ]}
    />
  )
}
