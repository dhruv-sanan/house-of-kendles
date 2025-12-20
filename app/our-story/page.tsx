import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/footer"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { Quote, Heart, Globe, Users } from "lucide-react"

export default function OurStoryPage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-surface">
        {/* --- 1. Hero Section: The Vision --- */}
        <section className="relative h-[80vh] min-h-[600px] w-full overflow-hidden">
          <Image
            src="/images/story/founders_hero.jpg" // Replace with a photo of Arti and Payal working or smiling together
            alt="Founders Arti Sanan and Payal Sethi"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-brand-900/90" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4">
            <span className="mb-4 inline-block rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium uppercase tracking-widest backdrop-blur-sm">
              The Journey
            </span>
            <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl text-gold drop-shadow-lg">
              More Than Just Wax
            </h1>
            <p className="mt-6 max-w-2xl text-lg md:text-xl text-white/90 font-light leading-relaxed">
              A story of sisterhood, resilience, and the burning desire to prove that a woman's place is wherever she chooses to be.
            </p>
          </div>
        </section>

        {/* --- 2. The Spark: Breaking Stereotypes --- */}
        <section className="py-24 px-6">
          <div className="mx-auto max-w-5xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden shadow-2xl rotate-3 md:rotate-0 transition-transform hover:rotate-0 duration-700">
                 <Image
                  src="/images/story/arti_payal_portrait.jpg" // Photo of Arti and Payal
                  alt="Arti Sanan and Payal Sethi"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="space-y-6">
                <h2 className="font-heading text-4xl text-brand-900">Two Sisters, One Dream</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  For cousins <strong>Arti Sanan</strong> and <strong>Payal Sethi</strong>, life revolved around the daily rhythms of household duties. But beneath the routine, a quiet ambition was simmering. They wanted more than just to manage a home; they wanted to build an empire.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Driven by a vision to prove that Indian homemakers are capable of extraordinary business acumen, they sought a venture they could nurture from their own premises. Their shared obsession with the warmth and serenity of candles became their canvas.
                </p>
                <div className="border-l-4 border-gold pl-6 py-2 italic text-xl text-brand-900/80">
                  "We wanted to show the world that our hands, which have nurtured families, can also craft a global brand."
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- 3. The Emotional Core: For Kenzo --- */}
        <section className="bg-brand-900 text-white py-24 px-6 relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-gold/10 blur-3xl" />
          
          <div className="mx-auto max-w-4xl text-center relative z-10">
            <Heart className="h-12 w-12 text-gold mx-auto mb-6 fill-current animate-pulse" />
            <h2 className="font-heading text-4xl md:text-5xl mb-8">The Heart of "Kendles"</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center text-left">
               <div className="prose prose-invert prose-lg">
                 <p>
                   Our name isn't just a creative spelling; it's a tribute. Just as Arti and Payal poured their first batch of candles—filled with hope and excitement—tragedy struck. Their beloved dog, <strong>Kenzo</strong>, passed away the very next day.
                 </p>
                 <p>
                   In their grief, they found purpose. The 'Ken' in <em>House of Kendles</em> is for Kenzo. The very first candle ever lit by the brand was in his memory. Every flicker of our flame carries his spirit—a reminder of unconditional love and loyalty.
                 </p>
               </div>
               <div className="relative h-80 w-full rounded-full overflow-hidden border-4 border-gold/30 shadow-2xl mx-auto md:h-96 md:w-96">
                 <Image
                    src="/images/story/kenzo_tribute.jpg" // Photo of Kenzo or the first candle lit for him
                    alt="Kenzo, the inspiration behind the name"
                    fill
                    className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                 />
               </div>
            </div>
          </div>
        </section>

        {/* --- 4. The Milestone: Vibe Exhibition --- */}
        <section className="py-24 px-6 bg-muted/30">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="font-heading text-4xl text-brand-900">A Family Affair</h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                Behind every successful woman is... a tribe that believes in her.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
               <div className="order-2 lg:order-1 space-y-6">
                 <p className="text-lg text-muted-foreground leading-relaxed">
                   Building a brand isn't a solo journey. With the unwavering support of their children—<strong>Dhruv Sanan</strong> (Arti's son) and <strong>Kashish Sethi</strong> (Payal's daughter)—the sisters took their passion to the public.
                 </p>
                 <p className="text-lg text-muted-foreground leading-relaxed">
                   Their debut at the <em>Vibe Exhibition</em> in their hometown wasn't just an event; it was a statement. It was the moment their "household hobby" was validated as a serious business. The overwhelming love and success they received there fueled their fire to go further.
                 </p>
               </div>
               <div className="order-1 lg:order-2 grid grid-cols-2 gap-4">
                  <div className="relative h-64 w-full rounded-lg overflow-hidden transform translate-y-8 shadow-lg">
                    <Image src="/images/story/exhibition_1.jpg" alt="Vibe Exhibition Stall" fill className="object-cover" />
                  </div>
                  <div className="relative h-64 w-full rounded-lg overflow-hidden shadow-lg">
                    <Image src="/images/story/team_family.jpg" alt="The Founders and their Children" fill className="object-cover" />
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* --- 5. The Future: Global Vision --- */}
        <section className="py-24 px-6 text-center">
          <div className="mx-auto max-w-4xl">
            <Globe className="h-16 w-16 text-brand-900 mx-auto mb-6" />
            <h2 className="font-heading text-5xl md:text-6xl text-brand-900 mb-8">From India to the World</h2>
            <p className="text-xl md:text-2xl text-muted-foreground font-light leading-relaxed mb-12">
              What started in a home is now ready to cross oceans. We are determined to launch India on a global platform, exporting our handcrafted stories of light and fragrance to homes across the globe.
            </p>
            <div className="inline-block p-1 rounded-full bg-gradient-to-r from-gold via-brand-900 to-gold">
              <Link href="/candles">
                <Button size="lg" className="bg-white text-brand-900 hover:bg-gray-50 border-0 rounded-full px-10 py-6 text-lg shadow-inner">
                  Be Part of Our Journey &rarr; Shop Now
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* --- 6. Meet the Team (Optional Gallery) --- */}
        <section className="py-16 px-6 border-t">
           <div className="mx-auto max-w-6xl">
             <h3 className="font-heading text-2xl text-center mb-10 text-muted-foreground">The Faces Behind the Flame</h3>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {/* Replace these with individual portraits if you have them, or group shots */}
                <div className="text-center">
                   <div className="relative h-48 w-48 mx-auto rounded-full overflow-hidden mb-4 border-2 border-brand/20">
                     <Image src="/images/story/arti.jpg" alt="Arti Sanan" fill className="object-cover" />
                   </div>
                   <h4 className="font-bold text-brand-900">Arti Sanan</h4>
                   <p className="text-sm text-muted-foreground">Co-Founder</p>
                </div>
                <div className="text-center">
                   <div className="relative h-48 w-48 mx-auto rounded-full overflow-hidden mb-4 border-2 border-brand/20">
                     <Image src="/images/story/payal.jpg" alt="Payal Sethi" fill className="object-cover" />
                   </div>
                   <h4 className="font-bold text-brand-900">Payal Sethi</h4>
                   <p className="text-sm text-muted-foreground">Co-Founder</p>
                </div>
                <div className="text-center">
                   <div className="relative h-48 w-48 mx-auto rounded-full overflow-hidden mb-4 border-2 border-brand/20">
                     <Image src="/images/story/dhruv.jpg" alt="Dhruv Sanan" fill className="object-cover" />
                   </div>
                   <h4 className="font-bold text-brand-900">Dhruv Sanan</h4>
                   <p className="text-sm text-muted-foreground">Operations & Support</p>
                </div>
                <div className="text-center">
                   <div className="relative h-48 w-48 mx-auto rounded-full overflow-hidden mb-4 border-2 border-brand/20">
                     <Image src="/images/story/kashish.jpg" alt="Kashish Sethi" fill className="object-cover" />
                   </div>
                   <h4 className="font-bold text-brand-900">Kashish Sethi</h4>
                   <p className="text-sm text-muted-foreground">Marketing & Strategy</p>
                </div>
             </div>
           </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}