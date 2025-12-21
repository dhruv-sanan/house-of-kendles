import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { getProducts, ProductWithVariants } from "@/app/_actions/products"
import { Button } from "@/components/ui/button"
import { ArrowDown, Flame, Coffee, Heart, Sparkles, Gift } from "lucide-react"
import Link from "next/link"

// Helper to filter products by their specific sub-category
function filterByCategory(products: ProductWithVariants[], categoryName: string) {
  return products.filter(p => p.category === categoryName)
}

function CategorySection({
  title,
  description,
  products,
  id,
  icon
}: {
  title: string;
  description?: string;
  products: ProductWithVariants[];
  id: string;
  icon?: React.ReactNode
}) {
  if (products.length === 0) return null

  return (
    <section id={id} className="py-16 scroll-mt-20 border-b last:border-0">
      <div className="mb-8 flex flex-col items-start gap-2">
        <div className="flex items-center gap-3">
          {icon && <div className="p-2 bg-brand/10 rounded-full text-brand">{icon}</div>}
          <h2 className="font-heading text-3xl">{title}</h2>
        </div>
        {description && <p className="text-muted-foreground max-w-2xl">{description}</p>}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  )
}

import { createClient } from "@/utils/supabase/server"
import { AddProductDialog } from "@/components/admin/AddProductDialog"

export default async function CandlesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isAdmin = user?.id === 'fa71f5fe-0f1a-41bd-ad55-228b07afbef6'

  // Fetch ALL products first (we filter in memory to save DB calls)
  const allProducts = await getProducts()

  // Filter into our new conceptual categories
  // Note: Ensure your DB 'category' column matches these, OR use name keywords if categories are generic
  const coffeeCollection = allProducts.filter(p => p.category === 'The Coffee Bar' || p.name.includes('Coffee') || p.name.includes('Latte'))
  const moodCollection = allProducts.filter(p => p.category === 'Mood & Quotes' || p.name.includes('Smells Like') || p.name.includes('Adulting'))
  const floralCollection = allProducts.filter(p => p.category === 'Floral Sculptures' || p.name.includes('Tulip') || p.name.includes('Peony'))
  const wellnessCollection = allProducts.filter(p => p.category === 'Spiritual & Wellness' || p.name.includes('Evil Eye'))
  const giftCollection = allProducts.filter(p => p.category === 'Gift Sets' || p.name.includes('Hamper'))

  const candleCollections = ['The Coffee Bar', 'Mood & Quotes', 'Floral Sculptures', 'Spiritual & Wellness', 'Gift Sets']

  return (
    <>
      <SiteHeader />
      <main>
        {/* Admin Add Product */}
        {isAdmin && (
          <div className="container mx-auto py-4 flex justify-end">
            <AddProductDialog
              isAdmin={isAdmin}
              categoryOptions={candleCollections}
              pageTitle="Candle"
            />
          </div>
        )}

        {/* --- Hero Section --- */}
        <section className="relative h-[60vh] min-h-[500px] w-full bg-cover bg-center" style={{ backgroundImage: "url('/images/candles/hero_candle_collage.jpg')" }}>
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/50" />

          <div className="relative z-10 flex h-full flex-col items-center justify-center text-center text-white px-4">
            <h1 className="font-heading text-5xl md:text-7xl text-gold drop-shadow-lg mb-6">Light Up Your World</h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl font-light leading-relaxed mb-8">
              Hand-poured soy wax candles for every mood, moment, and memory.
              From your morning coffee to your evening calm.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link href="#coffee-bar">
                <Button variant="secondary" size="lg" className="gap-2">
                  <Coffee className="h-4 w-4" /> Shop Coffee
                </Button>
              </Link>
              <Link href="#mood-quotes">
                <Button variant="secondary" size="lg" className="gap-2">
                  <Sparkles className="h-4 w-4" /> Shop Quotes
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* --- Benefits Banner --- */}
        <section className="bg-brand-900 text-white py-12">
          <div className="mx-auto max-w-6xl px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <h4 className="font-bold text-lg mb-2 text-gold">100% Natural Soy Wax</h4>
              <p className="text-sm text-white/80">Clean burning, eco-friendly, and longer lasting than paraffin.</p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-2 text-gold">Premium Fragrance Oils</h4>
              <p className="text-sm text-white/80">Curated scents that fill the room without overpowering it.</p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-2 text-gold">Hand-Poured in India</h4>
              <p className="text-sm text-white/80">Crafted with love and attention to detail in small batches.</p>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-4">

          {/* 1. The Coffee Bar */}
          <CategorySection
            id="coffee-bar"
            title="The Coffee Bar Collection"
            description="Your favorite cafe orders, reimagined. Rich, gourmand scents to jumpstart your day."
            products={coffeeCollection}
            icon={<Coffee />}
          />

          {/* 2. Mood & Quotes */}
          <CategorySection
            id="mood-quotes"
            title="Moods & Quotes"
            description="Candles that speak your mind. Perfect for gifting (or keeping for yourself)."
            products={moodCollection}
            icon={<Sparkles />}
          />

          {/* 3. Floral Sculptures */}
          <CategorySection
            id="floral"
            title="Floral Sculptures"
            description="Too pretty to burn? Almost. Intricate botanical designs that double as decor."
            products={floralCollection}
            icon={<Heart />}
          />

          {/* 4. Spiritual & Wellness */}
          <CategorySection
            id="spiritual"
            title="Spiritual & Wellness"
            description="Cleanse your space and invite positive energy with sage, sea salt, and protection motifs."
            products={wellnessCollection}
            icon={<Flame />}
          />

          {/* 5. Gift Sets */}
          <CategorySection
            id="gift-sets"
            title="Curated Gift Sets"
            description="The perfect present, already wrapped. Choose from our pre-selected favorites."
            products={giftCollection}
            icon={<Gift />}
          />

        </div>
      </main>
      <SiteFooter />
    </>
  )
}