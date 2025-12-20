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
import { FadeIn, SlideIn, BlurIn } from "@/components/ui/motion-wrappers"
import { Marquee } from "@/components/ui/marquee"

const SiteFooter = React.lazy(() => import('@/components/footer').then(module => ({ default: module.SiteFooter })))

export default async function HomePage() {
  // Fetch products where at least one variant is a bestseller
  const mostLoved = await getProducts({ bestseller: true })

  return (
    <>
      <SiteHeader />
      <main className="bg-surface overflow-x-hidden">
        <Hero />

        {/* --- Trusted/Features Strip --- */}
        <BlurIn className="border-b border-brand-900/5 bg-brand-900/5 py-4">
          <div className="mx-auto max-w-6xl px-4 flex justify-center gap-8 md:gap-16 text-brand-900/60 text-xs md:text-sm font-medium uppercase tracking-wider">
            <span>100% Soy Wax</span>
            <span>•</span>
            <span>Hand-Poured</span>
            <span>•</span>
            <span>Premium Fragrance</span>
          </div>
        </BlurIn>

        {/* --- Marquee Section (Brand/Press/Values) --- */}
        <div className="py-8 bg-brand-900/5 border-b border-brand-900/5">
          <Marquee speed={30} pauseOnHover>
            <span className="text-xl md:text-2xl font-heading text-brand-900/40 uppercase tracking-widest px-8">Organic Ingredients</span>
            <span className="text-xl md:text-2xl font-heading text-brand-900/40 uppercase tracking-widest px-8 hidden md:inline">•</span>
            <span className="text-xl md:text-2xl font-heading text-brand-900/40 uppercase tracking-widest px-8">Handcrafted with Love</span>
            <span className="text-xl md:text-2xl font-heading text-brand-900/40 uppercase tracking-widest px-8 hidden md:inline">•</span>
            <span className="text-xl md:text-2xl font-heading text-brand-900/40 uppercase tracking-widest px-8">Sustainable Packaging</span>
            <span className="text-xl md:text-2xl font-heading text-brand-900/40 uppercase tracking-widest px-8 hidden md:inline">•</span>
            <span className="text-xl md:text-2xl font-heading text-brand-900/40 uppercase tracking-widest px-8">Luxury Experience</span>
            <span className="text-xl md:text-2xl font-heading text-brand-900/40 uppercase tracking-widest px-8 hidden md:inline">•</span>
          </Marquee>
        </div>

        {/* --- Categories Section --- */}
        <section className="mx-auto max-w-7xl px-6 py-12 md:py-24">
          <FadeIn className="text-center mb-8 md:mb-16">
            <span className="text-brand-900 font-medium tracking-widest text-sm uppercase">Curated Collections</span>
            <h2 className="font-heading text-3xl md:text-5xl text-brand-900 mt-3">Explore by Category</h2>
          </FadeIn>

          {/* Mobile: Horizontal Scroll (show all 3, but scrollable to save vertical space) */}
          <div className="flex md:hidden overflow-x-auto gap-4 pb-4 -mx-6 px-6 snap-x snap-mandatory scrollbar-hide">
            <div className="min-w-[85vw] snap-center">
              <CategoryCard
                href="/candles"
                title="Aromatic Candles"
                query="candle%20luxury%20dark%20green"
                description="Scented soy wax for every mood."
              />
            </div>
            <div className="min-w-[85vw] snap-center">
              <CategoryCard
                href="/home-decor"
                title="Artisanal Decor"
                query="luxury%20home%20decor%20gold"
                description="Statement pieces that tell a story."
              />
            </div>
            <div className="min-w-[85vw] snap-center">
              <CategoryCard
                href="/bath-salt"
                title="Bath & Wellness"
                query="spa%20bath%20salts%20luxury"
                description="Rituals for relaxation and calm."
              />
            </div>
          </div>

          {/* Desktop: Grid */}
          <div className="hidden md:grid grid-cols-1 gap-8 md:grid-cols-3">
            <SlideIn delay={0.1} className="h-full">
              <CategoryCard
                href="/candles"
                title="Aromatic Candles"
                query="candle%20luxury%20dark%20green"
                description="Scented soy wax for every mood."
              />
            </SlideIn>
            <SlideIn delay={0.2} className="h-full">
              <CategoryCard
                href="/home-decor"
                title="Artisanal Decor"
                query="luxury%20home%20decor%20gold"
                description="Statement pieces that tell a story."
              />
            </SlideIn>
            <SlideIn delay={0.3} className="h-full">
              <CategoryCard
                href="/bath-salt"
                title="Bath & Wellness"
                query="spa%20bath%20salts%20luxury"
                description="Rituals for relaxation and calm."
              />
            </SlideIn>
          </div>
        </section>

        {/* --- Bestsellers Section (Carousel) --- */}
        <section className="bg-brand-900 text-white py-16 md:py-24 overflow-hidden">
          <div className="mx-auto max-w-7xl px-6">
            <FadeIn className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-5 h-5 text-gold fill-gold" />
                  <span className="text-gold font-medium tracking-widest text-sm uppercase">Customer Favorites</span>
                </div>
                <h2 className="font-heading text-3xl md:text-5xl text-white">Our Most Loved</h2>
              </div>
              <Link href="/candles#bestsellers">
                <Button variant="link" className="text-gold hover:text-white p-0 text-lg group">
                  View All Bestsellers <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </FadeIn>

            <SlideIn delay={0.2} className="relative">
              <Carousel
                opts={{
                  align: "start",
                  loop: true,
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-4">
                  {mostLoved.map((p) => (
                    <CarouselItem key={p.id} className="pl-4 basis-[70%] md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
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
            </SlideIn>
          </div>
        </section>

        {/* --- Gifting Banner --- */}
        <section className="relative py-24 md:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-[url('/images/hamper-bg-luxury.jpg')] bg-cover bg-center opacity-20" />
          {/* Fallback background color if image fails or while loading */}
          <div className="absolute inset-0 bg-brand-900/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/90 to-transparent" />

          <SlideIn className="relative z-10 mx-auto max-w-7xl px-6 flex flex-col items-start">
            <span className="text-brand-900 font-medium tracking-widest text-sm uppercase mb-4">The Art of Giving</span>
            <h3 className="font-heading text-4xl md:text-6xl text-brand-900 mb-6 max-w-xl">
              Curated with <br /> <span className="text-gold italic">Love & Care</span>
            </h3>
            <p className="text-brand-900/70 text-lg mb-8 max-w-lg leading-relaxed">
              Find the perfect gift to celebrate life's special moments. Handpicked luxuries wrapped in our signature gold-foiled boxes.
            </p>
            <Link href="/gifting">
              <Button size="lg" className="bg-brand-900 text-white hover:bg-brand-900/90 px-10 h-14 text-lg shadow-xl hover:shadow-2xl transition-all duration-300">
                Explore Gifting
              </Button>
            </Link>
          </SlideIn>
        </section>
      </main>
      <Suspense fallback={null}>
        <SiteFooter />
      </Suspense>
    </>
  )
}