import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { getProducts, ProductWithVariants } from "@/app/_actions/products"
import { InstagramEmbed } from "@/components/instagram-embed"
import { FeaturedProduct } from "./FeaturedProduct"
import { EvilEyeProductClient } from "./EvilEyeProduct"
import { Sparkles, Shield, Gift, ArrowDown } from "lucide-react"

// Helper function to find a product by slug from the fetched list
const findProduct = (products: Awaited<ReturnType<typeof getProducts>>, slug: string) => {
  return products.find(p => p.slug === slug);
}

export default async function HomeDecorPage() {
  const allProducts = await getProducts({ category: "Home Decor" })

  // --- Find our specific featured products ---
  const peacockHolder = findProduct(allProducts, "regal-peacock-hurricane-holder")
  const elephantUrli = findProduct(allProducts, "artisanal-elephant-urli-bowl")
  const evilEyeSet = findProduct(allProducts, "evil-eye-candle-set")
  
  // --- Categorize products for specific sections ---
  
  // Urlis
  const urliProducts = allProducts.filter(p => 
    p.name.toLowerCase().includes("urli") || 
    p.slug.includes("urli")
  )

  // Candle Holders (excluding the featured peacock & evil eye set to avoid duplication if desired, or keep them)
  // Here we include all candle holders for the grid view
  const candleHolderProducts = allProducts.filter(p => 
    (p.name.toLowerCase().includes("holder") || p.name.toLowerCase().includes("candle")) &&
    !p.name.toLowerCase().includes("urli") // Exclude urlis if they mention candles
  )

  // Trays
  const trayProducts = allProducts.filter(p => 
    p.name.toLowerCase().includes("tray") || 
    p.slug.includes("tray") ||
    p.slug.includes("coaster") // Coasters often go well with trays
  )

  return (
    <>
      <SiteHeader />
      <main>
        {/* --- Hero Section --- */}
        <section className="relative h-[70vh] min-h-[500px] w-full bg-cover bg-center bg-fixed" style={{backgroundImage: "url('/images/decor/peacock_holder.jpg')"}}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 flex h-full flex-col items-center justify-center text-center text-white px-4">
            <h1 className="font-heading text-5xl md:text-7xl text-gold drop-shadow-lg">Elevate Your Space</h1>
            <p className="mt-6 text-xl md:text-2xl text-white/95 max-w-2xl font-light">
              Discover artisanal decor that tells a story. From hand-carved accents to luxurious trays.
            </p>
            <div className="mt-10 animate-bounce">
                <ArrowDown className="h-8 w-8 text-white/80" />
            </div>
          </div>
        </section>

        {/* --- Benefits Section --- */}
        <section className="bg-white py-20">
          <div className="mx-auto max-w-6xl px-4">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                <div className="flex flex-col items-center">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-brand/5">
                    <Sparkles className="h-8 w-8 text-brand" />
                  </div>
                  <h3 className="font-heading text-2xl">Artisanal Craftsmanship</h3>
                  <p className="mt-3 text-muted-foreground leading-relaxed">Each piece is hand-selected for its unique detail, ensuring you receive a work of art.</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-brand/5">
                    <Shield className="h-8 w-8 text-brand" />
                  </div>
                  <h3 className="font-heading text-2xl">Positive Energy</h3>
                  <p className="mt-3 text-muted-foreground leading-relaxed">Invite good vibes and protection into your home with our symbolic pieces like the Evil Eye.</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-brand/5">
                    <Gift className="h-8 w-8 text-brand" />
                  </div>
                  <h3 className="font-heading text-2xl">Perfect for Gifting</h3>
                  <p className="mt-3 text-muted-foreground leading-relaxed">Packaged with care, our decor makes for a memorable gift that is both beautiful and meaningful.</p>
                </div>
             </div>
          </div>
        </section>

        {/* --- ID: candle-holders --- */}
        <section id="candle-holders" className="bg-muted/30 py-20 scroll-mt-20">
          <div className="mx-auto max-w-6xl px-4">
            <div className="mb-12 text-center">
                <h2 className="font-heading text-4xl mb-4">Candle Holders & Hurricanes</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">Create a warm, inviting glow with our collection of statement candle stands.</p>
            </div>
            
            <div className="space-y-20">
                {peacockHolder && <FeaturedProduct product={peacockHolder} orientation="left" />}
                
                {/* Interactive Evil Eye Product */}
                {evilEyeSet && (
                    <div className="pt-8">
                        <EvilEyeProductClient product={evilEyeSet} />
                    </div>
                )}
                
                {/* Remaining Candle Holders Grid */}
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 mt-12">
                    {candleHolderProducts
                        .filter(p => p.slug !== "regal-peacock-hurricane-holder" && p.slug !== "evil-eye-candle-set")
                        .map((p) => (
                        <ProductCard key={p.id} product={p} />
                    ))}
                </div>
            </div>
          </div>
        </section>

        {/* --- ID: urli --- */}
        <section id="urli" className="py-20 scroll-mt-20">
          <div className="mx-auto max-w-6xl px-4">
             <div className="mb-12 text-center">
                <h2 className="font-heading text-4xl mb-4">The Urli Collection</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">Traditional vessels reimagined for the modern home. Perfect for floating flowers or potpourri.</p>
            </div>

            {elephantUrli && (
                <div className="mb-12">
                    <FeaturedProduct product={elephantUrli} orientation="right" />
                </div>
            )}

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {urliProducts
                    .filter(p => p.slug !== "artisanal-elephant-urli-bowl")
                    .map((p) => (
                    <ProductCard key={p.id} product={p} />
                ))}
            </div>
          </div>
        </section>

        {/* --- ID: trays --- */}
        <section id="trays" className="bg-muted/30 py-20 scroll-mt-20">
          <div className="mx-auto max-w-6xl px-4">
            <div className="mb-12 text-center">
                <h2 className="font-heading text-4xl mb-4">Trays & Platters</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">Serve in style with our handcrafted trays, featuring intricate details and premium finishes.</p>
            </div>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {trayProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>

        {/* --- Instagram Embed --- */}
        <section className="py-20">
           <div className="mx-auto max-w-4xl px-4 text-center">
             <h2 className="font-heading text-3xl mb-4">Discover Our Urli Fragrances</h2>
             <p className="text-muted-foreground mb-8">See how our urlis come to life and learn about the best fragrances to pair with them.</p>
             <div className="flex justify-center">
                <InstagramEmbed 
                    postUrl="https://www.instagram.com/p/DPg3a3CE4Vq/"
                    title="House of Kendles Urli Fragrances" 
                />
             </div>
           </div>
        </section>

      </main>
      <SiteFooter />
    </>
  )
}