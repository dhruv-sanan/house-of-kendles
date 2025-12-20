import Link from "next/link"
import { Facebook, Instagram, Twitter } from "lucide-react" // Assuming you have these icons installed

export function SiteFooter() {
  return (
    <footer className="bg-brand-900 text-white pt-20 pb-10">
      <div className="mx-auto max-w-7xl px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div className="md:col-span-1">
          <h4 className="font-heading text-3xl text-gold mb-6">House of Kendles</h4>
          <p className="text-white/70 text-sm leading-relaxed mb-6">
            Crafted with care in India. Luxury minimalism for everyday serenity. We believe in the power of scent to transform spaces.
          </p>
          <div className="flex gap-4">
            {/* Social Icons */}
            <a href="https://www.instagram.com/houseofkendles/" className="text-white/60 hover:text-gold transition-colors"><Instagram className="w-5 h-5" /></a>
            <a href="#" className="text-white/60 hover:text-gold transition-colors"><Facebook className="w-5 h-5" /></a>
          </div>
        </div>

        <div>
          <h5 className="font-medium text-gold tracking-widest text-sm uppercase mb-6">Shop</h5>
          <ul className="space-y-4 text-sm text-white/70">
            <li><Link href="/candles" className="hover:text-white transition-colors">Candles</Link></li>
            <li><Link href="/home-decor" className="hover:text-white transition-colors">Home Decor</Link></li>
            <li><Link href="/bath-salt" className="hover:text-white transition-colors">Bath & Wellness</Link></li>
            <li><Link href="/gifting" className="hover:text-white transition-colors">Gifting</Link></li>
          </ul>
        </div>

        <div>
          <h5 className="font-medium text-gold tracking-widest text-sm uppercase mb-6">Explore</h5>
          <ul className="space-y-4 text-sm text-white/70">
            <li><Link href="/our-story" className="hover:text-white transition-colors">Our Story</Link></li>
            <li><Link href="/candle-care" className="hover:text-white transition-colors">Candle Care</Link></li>
            <li><Link href="/quiz" className="hover:text-white transition-colors">Scent Quiz</Link></li>
            <li><Link href="/admin/login" className="hover:text-white transition-colors">Admin Login</Link></li>
          </ul>
        </div>

        <div>
          <h5 className="font-medium text-gold tracking-widest text-sm uppercase mb-6">Stay in the Know</h5>
          <p className="text-white/70 text-sm mb-4">Subscribe for exclusive offers and new launches.</p>
          <form className="flex gap-2">
            <input
              type="email"
              placeholder="Your email"
              className="bg-white/10 border border-white/20 rounded px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-gold w-full"
            />
            <button className="bg-gold text-brand-900 px-4 py-2 rounded text-sm font-medium hover:bg-white transition-colors">
              Join
            </button>
          </form>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/40">
        <p>© {new Date().getFullYear()} House of Kendles. All rights reserved.</p>
        <div className="flex gap-6">
          <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link>
        </div>
      </div>
    </footer>
  )
}