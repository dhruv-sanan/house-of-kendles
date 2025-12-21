import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="relative bg-brand-900 text-white overflow-hidden">
      {/* Background decoration or pattern could go here */}

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-32">
        <div className="flex flex-col items-start space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <span className="text-gold font-medium tracking-widest text-sm uppercase">
            Handcrafted in India
          </span>
          <h1 className="font-heading text-5xl leading-[1.1] md:text-6xl lg:text-7xl text-white">
            The Art of <br />
            <span className="text-gold italic">Slow Living</span>
          </h1>
          <p className="text-lg text-white/80 leading-relaxed max-w-md">
            Discover handcrafted aromas and decor designed to bring serenity, elegance, and mindfulness to your modern home.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <Link href="/candles">
              <Button size="lg" className="bg-gold text-brand-900 hover:bg-white hover:text-brand-900 font-semibold px-8 transition-all duration-300">
                Shop Candles
              </Button>
            </Link>
            <Link href="/home-decor">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 hover:border-white bg-transparent font-medium px-8 transition-all duration-300">
                Home Decor
              </Button>
            </Link>
          </div>
        </div>

        <div className="relative aspect-[4/5] w-full lg:aspect-square rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-1000 delay-200 border border-white/10">
          {/* Use a high-quality lifestyle image here. Using placeholder for now based on your setup */}
          <div className="absolute inset-0 bg-[url('/images/candles/hero_candle_collage.jpg')] bg-cover bg-center hover:scale-105 transition-transform duration-700 ease-out" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-900/40 to-transparent" />
        </div>
      </div>
    </section>
  )
}