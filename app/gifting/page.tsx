import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getProducts, getProductBySlug } from "@/app/_actions/products"
import { Gift, Sparkles, HeartHandshake, ArrowDown } from "lucide-react"
import { AddKitToCartButton } from "@/components/add-kit-to-cart-button"
import { createClient } from "@/utils/supabase/server"
import { AddProductDialog } from "@/components/admin/AddProductDialog"

export default async function GiftingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isAdmin = user?.id === 'fa71f5fe-0f1a-41bd-ad55-228b07afbef6'

  const giftingProducts = await getProducts({ category: "Gifting" })

  // Try to fetch the real DIY Kit product
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
    // Ignore error
  }

  return (
    <>
      <SiteHeader />
      <main>
        {/* Admin Add Product */}
        {isAdmin && (
          <div className="container mx-auto py-4 flex justify-end">
            <AddProductDialog
              isAdmin={isAdmin}
              fixedCategory="Gifting"
              pageTitle="Gift Set"
            />
          </div>
        )}

        {/* --- Hero Section (Full Width) --- */}
        <section className="relative h-[65vh] min-h-[500px] w-full bg-cover bg-center bg-fixed" style={{ backgroundImage: "url('/images/hamper-bg-luxury.jpg')" }}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative z-10 flex h-full flex-col items-center justify-center text-center text-white px-4">
            <span className="text-gold font-medium tracking-widest text-sm uppercase mb-4">The Art of Giving</span>
            <h1 className="font-heading text-5xl md:text-7xl text-white drop-shadow-lg mb-6">
              Curated with <span className="text-gold italic">Love</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl font-light leading-relaxed mb-8">
              Find the perfect gift to celebrate life's special moments. Handpicked luxuries wrapped in our signature gold-foiled boxes.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="#collections">
                <Button className="bg-gold text-brand-900 hover:bg-white hover:text-brand-900 font-semibold px-8 h-12 text-lg">
                  Shop Collections
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* --- Benefits Section --- */}
        <section className="bg-white py-20">
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

        {/* --- Signature Collections --- */}
        <section id="collections" className="bg-muted/30 py-24 scroll-mt-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center mb-16">
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
                <Link href={`/product/${diyKitProduct?.slug || 'diy-candle-kit'}`} className="group-hover:text-brand-700 transition-colors">
                  <h2 className="font-heading text-4xl md:text-5xl text-brand-900 mb-6 hover:underline decoration-brand-900/30 underline-offset-8">DIY Candle Kit</h2>
                </Link>
                <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                  Give the gift of creativity. Our DIY kit comes with everything needed to pour a custom soy candle at home: pre-measured wax, a premium fragrance oil of choice, a glass jar, wick, and easy-to-follow instructions.
                </p>
                <div className="flex items-baseline gap-4 mb-8">
                  <span className="text-3xl font-light text-brand-900">₹{diyKitProduct?.price || 550}</span>
                  {diyKitProduct?.price !== 750 && <span className="text-sm text-muted-foreground line-through">₹750</span>}
                </div>

                <AddKitToCartButton product={diyKitProduct} />
              </div>
              <Link
                href={`/product/${diyKitProduct?.slug || 'diy-candle-kit'}`}
                className="order-1 md:order-2 relative h-[500px] w-full rounded-2xl overflow-hidden shadow-2xl block group"
              >
                <div className="absolute inset-0 bg-[url('/images/decor/tray_cane_tan.jpg')] bg-cover bg-center group-hover:scale-105 transition-transform duration-1000" />
                {/* Overlay hint */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <span className="bg-white/90 text-brand-900 px-6 py-2 rounded-full font-medium shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">View Details</span>
                </div>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}