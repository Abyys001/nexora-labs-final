import SiteLayout from "./(site)/layout"
import SiteNotFound from "./(site)/not-found"

// Unmatched URLs render outside route groups, so wrap them in the site chrome here.
export default function GlobalNotFound() {
  return (
    <SiteLayout>
      <SiteNotFound />
    </SiteLayout>
  )
}
