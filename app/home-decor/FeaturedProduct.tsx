import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ProductWithVariants } from "@/app/_actions/products"
import { ArrowRight } from "lucide-react"

type FeaturedProductProps = {
  product: ProductWithVariants
  orientation?: "left" | "right"
}

export function FeaturedProduct({ product, orientation = "left" }: FeaturedProductProps) {
  const variant = product.variants[0]
  if (!variant) return null

  const imageUrl = variant.image_url || product.image_url || "https://res.cloudinary.com/dq077uui5/image/upload/v1766345243/House_of-2_page-0001_pzag8s.jpg"

  const imageContent = (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg shadow-lg">
      <Image
        src={imageUrl}
        alt={product.name}
        width={800}
        height={600}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
    </div>
  )

  const textContent = (
    <div className="flex flex-col justify-center">
      <h3 className="font-heading text-3xl">{product.name}</h3>
      <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
        {product.description}
      </p>
      <ul className="mt-4 space-y-2">
        <li className="flex items-center gap-2">
          <ArrowRight className="h-5 w-5 text-brand" />
          <span>{product.name === 'Artisanal Elephant Urli Bowl' ? 'How to Use: Fill with water & float petals or t-lights.' : 'Material: Premium glass and brass-finished metal.'}</span>
        </li>
        <li className="flex items-center gap-2">
          <ArrowRight className="h-5 w-5 text-brand" />
          <span>{product.name === 'Artisanal Elephant Urli Bowl' ? 'Material: Smokey glass & brass-finished metal.' : 'Use: Perfect for pillar candles or as a vase.'}</span>
        </li>
      </ul>
      <div className="mt-6">
        <Button size="lg" className="bg-brand text-primary-foreground hover:bg-brand-900 pointer-events-none">
          Shop Now
        </Button>
      </div>
    </div>
  )

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-12">
        {orientation === "left" ? (
          <>
            {imageContent}
            {textContent}
          </>
        ) : (
          <>
            <div className="md:order-last">{imageContent}</div>
            <div className="md:order-first">{textContent}</div>
          </>
        )}
      </div>
    </Link>
  )
}