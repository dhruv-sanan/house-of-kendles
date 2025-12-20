import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getProducts, getProductBySlug } from "@/app/_actions/products"
import { Gift, Sparkles, HeartHandshake } from "lucide-react"
import { AddKitToCartButton } from "@/components/add-kit-to-cart-button"

export default async function GiftingPage() {
  const giftingProducts = await getProducts({ category: "Gifting" })

  // Try to fetch the real DIY Kit product, otherwise pass null to use fallback in component
  let diyKitProduct = null
  try {
    const fetchedProduct = await getProductBySlug("diy-candle-kit")
    if (fetchedProduct && fetchedProduct.variants.length > 0) {
      diyKitProduct = {
        id: fetchedProduct.id,
        name: fetchedProduct.name,
        slug: fetchedProduct.slug,
        price: fetchedProduct.variants[0].price,
        image_url: fetchedProduct.variants[0].image_url || fetchedProduct.image_url,
        variant_id: fetchedProduct.variants[0].id
      }
    }
  } catch (e) {
    // Ignore error, use fallback
  }

  return (
    <>
      <SiteHeader />
      <main className="bg-surface">
        {/* --- Hero Section (Themed like Home) --- */}
        <section className="relative bg-brand-900 text-white overflow-hidden">
          <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-32">
            <div className="flex flex-col items-start space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <span className="text-gold font-medium tracking-widest text-sm uppercase">
                The Art of Giving
              </span>
              <h1 className="font-heading text-5xl leading-[1.1] md:text-6xl lg:text-7xl text-white">
                Curated with <br />
                <span className="text-gold italic">Love & Care</span>
              </h1>
              <p className="text-lg text-white/80 leading-relaxed max-w-md">
                Find the perfect gift to celebrate life's special moments. Handpicked luxuries wrapped in our signature gold-foiled boxes.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link href="#collections">
                  <Button size="lg" className="bg-gold text-brand-900 hover:bg-white hover:text-brand-900 font-semibold px-8 transition-all duration-300">
                    Shop Collections
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative aspect-[4/5] w-full lg:aspect-square rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-1000 delay-200 border border-white/10">
              <div className="absolute inset-0 bg-[url('/images/hamper-bg-luxury.jpg')] bg-cover bg-center hover:scale-105 transition-transform duration-700 ease-out" />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-900/40 to-transparent" />
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
        <section id="collections" className="bg-muted/30 py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center mb-16">
              <span className="text-brand-900 font-medium tracking-widest text-sm uppercase">Ready to Ship</span>
              <h2 className="font-heading text-4xl md:text-5xl text-brand-900 mt-3">Signature Collections</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto mt-4">Thoughtfully assembled luxury for every occasion.</p>
            </div>

            {giftingProducts.length > 0 ? (
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {giftingProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 border-2 border-dashed border-brand/10 rounded-2xl bg-white/50">
                <p className="text-muted-foreground text-lg">Our signature collections are currently strictly limited.</p>
                <p className="text-sm text-muted-foreground mt-2">Please check back soon.</p>
              </div>
            )}
          </div>
        </section>

        {/* --- DIY Kit Highlight --- */}
        <section id="diy-kit" className="py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div className="order-2 md:order-1">
                <span className="text-brand-900 font-medium tracking-widest text-sm uppercase mb-2 block">The Experience Gift</span>
                <h2 className="font-heading text-4xl md:text-5xl text-brand-900 mb-6">DIY Candle Kit</h2>
                <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                  Give the gift of creativity. Our DIY kit comes with everything needed to pour a custom soy candle at home: pre-measured wax, a premium fragrance oil of choice, a glass jar, wick, and easy-to-follow instructions.
                </p>
                <div className="flex items-baseline gap-4 mb-8">
                  <span className="text-3xl font-light text-brand-900">₹{diyKitProduct?.price || 550}</span>
                  <span className="text-sm text-muted-foreground line-through">₹750</span>
                </div>

                <AddKitToCartButton product={diyKitProduct} />
              </div>
              <div className="order-1 md:order-2 relative h-[600px] w-full rounded-2xl overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-[url('/images/decor/tray_cane_tan.jpg')] bg-cover bg-center hover:scale-105 transition-transform duration-1000" />
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}