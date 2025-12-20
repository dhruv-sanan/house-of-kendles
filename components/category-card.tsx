import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

export function CategoryCard({
  href,
  title,
  query,
  description
}: {
  href: string
  title: string
  query: string
  description?: string
}) {
  return (
    <Link href={href} className="group block relative overflow-hidden rounded-xl" aria-label={`Shop ${title}`}>
      <div className="relative aspect-[3/4] w-full overflow-hidden">
        {/* Image Placeholder - replace with actual category images in production */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
          style={{
            backgroundImage: `url('/images/category-${title.toLowerCase().replace(/\s+/g, '-')}.jpg')`, // Try to load local image first
            // Fallback logic would go here in a real app, or just rely on the user uploading images
             backgroundColor: 'var(--color-brand-900)' // Fallback color
          }}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300" />
        
        <div className="absolute inset-0 p-8 flex flex-col justify-end">
          <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <h3 className="font-heading text-3xl text-white mb-2">{title}</h3>
            {description && (
              <p className="text-white/90 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                {description}
              </p>
            )}
            <div className="mt-4 flex items-center gap-2 text-gold text-sm font-medium uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
              Shop Now <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}