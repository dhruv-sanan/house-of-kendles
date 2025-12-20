import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/footer"
import { getProducts } from "@/app/_actions/products"
import { HamperBuilder } from "./HamperBuilder" // We'll create this interactive component

export default async function HamperPage() {
  // Fetch all products that are eligible for hampers
  // In a real app, you might have a specific 'hamper-eligible' flag
  const allProducts = await getProducts()
  
  // Filter suitable products (e.g., small items, candles)
  const hamperItems = allProducts.filter(p => 
    p.category === 'Candles' || 
    p.category === 'Bath & Wellness' ||
    p.slug.includes('coaster')
  )

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-surface">
        {/* Header */}
        <div className="bg-brand-900 text-white py-12 text-center">
          <h1 className="font-heading text-4xl md:text-5xl text-gold">Build Your Own Hamper</h1>
          <p className="mt-3 text-white/80">Select your favorites to create a bespoke gift box.</p>
        </div>

        {/* Interactive Builder Component */}
        <HamperBuilder products={hamperItems} />
        
      </main>
      <SiteFooter />
    </>
  )
}