import { SiteHeader } from "@/components/site-header"
import { Hero } from "@/components/hero"
import { ProductCard } from "@/components/product-card"
import { CategoryCard } from "@/components/category-card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getProducts } from "@/app/_actions/products"
import React, { Suspense } from "react"
import { ArrowRight, Star } from "lucide-react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

const SiteFooter = React.lazy(() => import('@/components/footer').then(module => ({ default: module.SiteFooter })))

export default async function HomePage() {
  // Fetch products where at least one variant is a bestseller
  const mostLoved = await getProducts({ bestseller: true })

  return (
    <>
      <SiteHeader />
      <main className="bg-surface">
        <Hero />

        {/* --- Trusted/Features Strip --- */}
        <div className="border-b border-brand-900/5 bg-brand-900/5 py-4">
          <div className="mx-auto max-w-6xl px-4 flex justify-center gap-8 md:gap-16 text-brand-900/60 text-xs md:text-sm font-medium uppercase tracking-wider">
            <span>100% Soy Wax</span>
            <span>•</span>
            <span>Hand-Poured</span>
            <span>•</span>
            <span>Premium Fragrance</span>
          </div>
        </div>

        {/* --- Categories Section --- */}
        <section className="mx-auto max-w-7xl px-6 py-24">
          <div className="text-center mb-16">
            <span className="text-brand-900 font-medium tracking-widest text-sm uppercase">Curated Collections</span>
            <h2 className="font-heading text-4xl md:text-5xl text-brand-900 mt-3">Explore by Category</h2>
          </div>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <CategoryCard 
              href="/candles" 
              title="Aromatic Candles" 
              query="candle%20luxury%20dark%20green" 
              description="Scented soy wax for every mood."
            />
            <CategoryCard 
              href="/home-decor" 
              title="Artisanal Decor" 
              query="luxury%20home%20decor%20gold" 
              description="Statement pieces that tell a story."
            />
            <CategoryCard 
              href="/bath-salt" 
              title="Bath & Wellness" 
              query="spa%20bath%20salts%20luxury" 
              description="Rituals for relaxation and calm."
            />
          </div>
        </section>

        {/* --- Bestsellers Section (Carousel) --- */}
        <section className="bg-brand-900 text-white py-24 overflow-hidden">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-5 h-5 text-gold fill-gold" />
                  <span className="text-gold font-medium tracking-widest text-sm uppercase">Customer Favorites</span>
                </div>
                <h2 className="font-heading text-4xl md:text-5xl text-white">Our Most Loved</h2>
              </div>
              <Link href="/candles#bestsellers">
                <Button variant="link" className="text-gold hover:text-white p-0 text-lg group">
                  View All Bestsellers <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>

            <div className="relative">
              <Carousel
                opts={{
                  align: "start",
                  loop: true,
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-4">
                  {mostLoved.map((p) => (
                    <CarouselItem key={p.id} className="pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                      <div className="h-full">
                         <ProductCard 
                            product={p} 
                            className="h-full bg-white/5 border-white/10 text-white hover:bg-white/10 transition-colors" 
                         />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="hidden md:block">
                  <CarouselPrevious className="bg-brand-900 border-white/20 text-white hover:bg-white hover:text-brand-900 -left-12" />
                  <CarouselNext className="bg-brand-900 border-white/20 text-white hover:bg-white hover:text-brand-900 -right-12" />
                </div>
              </Carousel>
            </div>
          </div>
        </section>

        {/* --- Gifting Banner --- */}
        <section className="relative py-32 overflow-hidden">
          <div className="absolute inset-0 bg-[url('/images/hamper-bg-luxury.jpg')] bg-cover bg-center opacity-20" /> 
          {/* Fallback background color if image fails or while loading */}
          <div className="absolute inset-0 bg-brand-900/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/90 to-transparent" />
          
          <div className="relative z-10 mx-auto max-w-7xl px-6 flex flex-col items-start">
            <span className="text-brand-900 font-medium tracking-widest text-sm uppercase mb-4">The Art of Gifting</span>
            <h3 className="font-heading text-5xl md:text-6xl text-brand-900 mb-6 max-w-xl">
              Curate Your Own <br/> <span className="text-gold italic">Signature Hamper</span>
            </h3>
            <p className="text-brand-900/70 text-lg mb-8 max-w-lg leading-relaxed">
              Create a bespoke gift box filled with your favorite scents and decor pieces. 
              Perfect for weddings, corporate gifts, or a special treat for yourself.
            </p>
            <Link href="/hamper">
              <Button size="lg" className="bg-brand-900 text-white hover:bg-brand-900/90 px-10 h-14 text-lg shadow-xl hover:shadow-2xl transition-all duration-300">
                Start Building
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Suspense fallback={null}>
        <SiteFooter />
      </Suspense>
    </>
  )
}