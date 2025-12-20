import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/footer"
import { getProducts } from "@/app/_actions/products"
import { QuizClient } from "./QuizClient"

export default async function QuizPage() {
  // Fetch products to pass to the quiz for recommendations.
  // We fetch everything so we can filter on the client side without extra requests.
  const allProducts = await getProducts()

  return (
    <>
      <SiteHeader />
      <main className="bg-surface min-h-screen">
        {/* Hero / Intro */}
        <section className="bg-brand-900 text-white py-16 md:py-24 text-center px-4">
          <h1 className="font-heading text-4xl md:text-6xl text-gold mb-4">
            Find Your Signature Scent
          </h1>
          <p className="text-lg text-white/80 max-w-xl mx-auto">
            Answer 2 simple questions to discover the perfect aroma for your space and soul.
          </p>
        </section>

        {/* Quiz Area */}
        <div className="mx-auto max-w-5xl px-4 py-12 md:py-20">
          <QuizClient products={allProducts} />
        </div>
      </main>
      <SiteFooter />
    </>
  )
}