import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getProducts } from "@/app/_actions/products"
import { Gift, Sparkles, HeartHandshake } from "lucide-react"

export default async function GiftingPage() {
  const giftingProducts = await getProducts({ category: "Gifting" })

  return (
    <>
      <SiteHeader />
      <main>
        {/* --- Hero Section --- */}
        <section className="relative h-[60vh] min-h-[500px] w-full bg-cover bg-center" style={{backgroundImage: "url('/images/hamper-bg-luxury.jpg')"}}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 flex h-full flex-col items-center justify-center text-center text-white px-4">
            <span className="mb-4 inline-block rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium uppercase tracking-widest backdrop-blur-sm border border-white/30">
              The Art of Giving
            </span>
            <h1 className="font-heading text-5xl md:text-7xl text-gold drop-shadow-lg">
              Curated with Love
            </h1>
            <p className="mt-6 text-xl md:text-2xl text-white/90 max-w-2xl font-light leading-relaxed">
              Whether it's a pre-designed luxury box or a custom creation, find the perfect gift to celebrate life's special moments.
            </p>
            <div className="mt-10 flex gap-4">
               <Link href="/hamper">
                <Button size="lg" className="bg-gold text-brand-900 hover:bg-white hover:text-brand-900 font-semibold px-8 h-14">
                  Build Your Own Hamper
                </Button>
              </Link>
              <Link href="#collections">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-brand-900 px-8 h-14">
                  Shop Collections
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* --- Why Choose Us --- */}
        <section className="bg-surface py-20">
           <div className="mx-auto max-w-6xl px-4">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                <div className="flex flex-col items-center">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-brand/5 text-brand">
                    <Gift className="h-8 w-8" />
                  </div>
                  <h3 className="font-heading text-2xl text-brand-900">Premium Packaging</h3>
                  <p className="mt-3 text-muted-foreground leading-relaxed">Every hamper is wrapped in our signature gold-foiled boxes with satin ribbons.</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-brand/5 text-brand">
                    <Sparkles className="h-8 w-8" />
                  </div>
                  <h3 className="font-heading text-2xl text-brand-900">Handpicked Luxuries</h3>
                  <p className="mt-3 text-muted-foreground leading-relaxed">We select only the finest candles, decor, and wellness items for our sets.</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-brand/5 text-brand">
                    <HeartHandshake className="h-8 w-8" />
                  </div>
                  <h3 className="font-heading text-2xl text-brand-900">Personal Touch</h3>
                  <p className="mt-3 text-muted-foreground leading-relaxed">Add a handwritten note to make your gift truly unforgettable.</p>
                </div>
             </div>
           </div>
        </section>

        {/* --- Pre-Curated Collections --- */}
        <section id="collections" className="bg-muted/30 py-20">
          <div className="mx-auto max-w-6xl px-4">
            <div className="text-center mb-16">
              <h2 className="font-heading text-4xl text-brand-900 mb-4">Signature Collections</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Ready-to-ship luxury, thoughtfully assembled for every occasion.</p>
            </div>

            {giftingProducts.length > 0 ? (
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {giftingProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            ) : (
               <div className="text-center py-12 border-2 border-dashed border-brand/20 rounded-lg">
                 <p className="text-muted-foreground">Our signature collections are currently being restocked. Try building your own!</p>
               </div>
            )}
          </div>
        </section>

        {/* --- DIY Kit Highlight --- */}
        <section id="diy-kit" className="py-20">
          <div className="mx-auto max-w-6xl px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
               <div className="order-2 md:order-1">
                 <h2 className="font-heading text-4xl text-brand-900 mb-6">The Experience Gift: DIY Candle Kit</h2>
                 <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                   Give the gift of creativity. Our DIY kit comes with everything needed to pour a custom soy candle at home: pre-measured wax, a premium fragrance oil of choice, a glass jar, wick, and easy-to-follow instructions.
                 </p>
                 <div className="flex items-baseline gap-4 mb-8">
                    <span className="text-3xl font-light text-brand-900">₹550</span>
                    <span className="text-sm text-muted-foreground line-through">₹750</span>
                 </div>
                 <Button size="lg" className="bg-brand text-white hover:bg-brand-900 w-full md:w-auto">
                   Add Kit to Cart
                 </Button>
               </div>
               <div className="order-1 md:order-2 relative h-[500px] w-full rounded-lg overflow-hidden shadow-2xl">
                  {/* Placeholder for DIY Kit Image */}
                  <div className="absolute inset-0 bg-[url('/images/decor/tray_cane_tan.jpg')] bg-cover bg-center" /> 
               </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}