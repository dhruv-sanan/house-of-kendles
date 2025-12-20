import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/footer"

export default function CandleCarePage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="font-heading text-3xl">Candle Care Guide</h1>
        <ul className="mt-6 list-disc space-y-2 pl-6 leading-relaxed">
          <li>Trim the wick to 1/4 inch before each burn for a clean flame.</li>
          <li>Allow the wax to melt to the edges on first burn to prevent tunneling.</li>
          <li>Keep away from drafts and never leave unattended.</li>
          <li>For soy wax blends, expect a soft natural finish—this is a mark of quality.</li>
        </ul>
      </main>
      <SiteFooter />
    </>
  )
}
