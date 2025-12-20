"use client"

import Image from "next/image"
import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart"
import { ProductWithVariants, ProductVariant } from "@/app/_actions/products"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Check, Droplet, Leaf, Sparkle, Info, Flame, ShieldCheck } from "lucide-react" // Added Info icon
import { IngredientsModal } from "@/app/bath-salt/IngredientsModal"

// ... (BenefitItem component remains the same)
function BenefitItem({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="mt-1 text-muted-foreground">{children}</p>
      </div>
    </div>
  )
}

export function BathSaltClientPage({ product }: { product: ProductWithVariants }) {
  const { addItem } = useCart()
  const { toast } = useToast()

  const [selectedFlavor, setSelectedFlavor] = useState<string>("Lavender")
  const [selectedSize, setSelectedSize] = useState<string>("400g")
  const [isIngredientsOpen, setIsIngredientsOpen] = useState(false)
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null)

  // --- Derived Data Logic (Unchanged) ---
  const flavorData = useMemo(() => {
    const flavorMap = new Map<string, { isBestseller: boolean, image: string | null }>()
    for (const v of product.variants) {
      if (!v.flavor) continue
      const existing = flavorMap.get(v.flavor)
      flavorMap.set(v.flavor, {
        isBestseller: existing?.isBestseller || v.is_bestseller,
        image: existing?.image || v.image_url || null
      })
    }
    return Array.from(flavorMap.entries()).map(([name, data]) => ({ name, ...data }))
  }, [product.variants])

  const sizes = useMemo(() => {
    return [...new Set(product.variants.map(v => v.size).filter(Boolean))] as string[]
  }, [product.variants])

  const selectedVariant = useMemo(() => {
    return product.variants.find(
      v => v.flavor === selectedFlavor && v.size === selectedSize
    )
  }, [selectedFlavor, selectedSize, product.variants])

  const { imageList, flavorImageMap } = useMemo(() => {
    const flavorMap = new Map<string, string>()
    const allImages = new Set<string>()

    for (const v of product.variants) {
      if (v.flavor && v.image_url && !flavorMap.has(v.flavor)) {
        flavorMap.set(v.flavor, v.image_url)
        allImages.add(v.image_url)
      }
    }
    if (product.image_url) allImages.add(product.image_url)
    product.variants.forEach(v => {
      if (v.image_url) allImages.add(v.image_url)
      v.image_urls?.forEach(url => allImages.add(url))
    })
    
    let finalList = Array.from(allImages)
    if (finalList.length === 0) finalList.push("/placeholder.png")
    
    return { imageList: finalList, flavorImageMap: flavorMap }
  }, [product.variants, product.image_url])

  const handleFlavorChange = (flavor: string) => {
    setSelectedFlavor(flavor)
    if (!carouselApi) return
    const imageUrl = flavorImageMap.get(flavor)
    if (!imageUrl) return
    const imageIndex = imageList.findIndex(url => url === imageUrl)
    if (imageIndex !== -1) {
      carouselApi.scrollTo(imageIndex)
    }
  }

  const handleAddToCart = () => {
    if (!selectedVariant) {
      toast({ title: "Please select a flavor and size", variant: "destructive" })
      return
    }
    addItem({
      variant_id: selectedVariant.id,
      product_id: product.id,
      name: `${product.name} - ${selectedVariant.flavor}`,
      slug: product.slug,
      size: selectedVariant.size || "Standard",
      price: selectedVariant.price,
      image_url: imageList[0],
      qty: 1,
    })
    toast({ title: "Added to cart!", description: `${product.name} (${selectedVariant.flavor} / ${selectedVariant.size})` })
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Carousel Section */}
        <Carousel className="w-full" opts={{ loop: true }} setApi={setCarouselApi}>
          <CarouselContent>
            {imageList.map((url, index) => (
              <CarouselItem key={index}>
                <div className="relative aspect-square overflow-hidden rounded-lg shadow-lg">
                  <Image
                    src={url}
                    alt={`${product.name} - view ${index + 1}`}
                    width={960}
                    height={960}
                    className="h-full w-full object-cover"
                    priority={index === 0}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute left-3" />
          <CarouselNext className="absolute right-3" />
        </Carousel>

        {/* Product Info & Selection */}
        <div className="space-y-6">
          <h1 className="font-heading text-4xl">{product.name}</h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Melt away stress and soothe tired muscles. Our luxury bath salts are crafted with a blend of mineral-rich Himalayan pink salt, Epsom salts and pure essential oils to transform your bath into a tranquil spa experience.
          </p>
          <p className="text-3xl font-light">
            {selectedVariant?.price ? `₹${selectedVariant.price}` : `Please select options`}
          </p>

          {/* Flavor Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Choose Your Scent:</Label>
            <RadioGroup
              value={selectedFlavor}
              onValueChange={handleFlavorChange}
              className="flex flex-wrap gap-3"
            >
              {flavorData.map((flavor) => (
                <Label
                  key={flavor.name}
                  className={cn(
                    "relative flex cursor-pointer items-center justify-center rounded-full border px-4 py-2 text-sm transition-colors",
                    selectedFlavor === flavor.name 
                      ? "border-brand-900 bg-brand/10 text-brand-900 ring-2 ring-brand/50" 
                      : "hover:bg-muted/50"
                  )}
                >
                  <RadioGroupItem value={flavor.name} className="sr-only" />
                  {flavor.name}
                  {flavor.isBestseller && (
                    <Badge className="absolute -top-3 -right-3 bg-gold text-black shadow-md">
                      Bestseller
                    </Badge>
                  )}
                </Label>
              ))}
            </RadioGroup>
          </div>

          {/* Size Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Choose Your Size:</Label>
            <RadioGroup
              value={selectedSize}
              onValueChange={setSelectedSize}
              className="flex flex-wrap gap-3"
            >
              {sizes.map((size) => (
                <Label
                  key={size}
                  className={cn(
                    "flex cursor-pointer items-center justify-center rounded-full border px-4 py-2 text-sm transition-colors",
                    selectedSize === size 
                      ? "border-brand-900 bg-brand/10 text-brand-900 ring-2 ring-brand/50" 
                      : "hover:bg-muted/50"
                  )}
                >
                  <RadioGroupItem value={size} className="sr-only" />
                  {size}
                </Label>
              ))}
            </RadioGroup>
          </div>

          {/* Add to Cart Button */}
          <Button
            className="w-full bg-brand text-lg text-primary-foreground hover:bg-brand-900 h-12"
            onClick={handleAddToCart}
            disabled={!selectedVariant || selectedVariant.stock_quantity === 0}
          >
            {selectedVariant ? 
              (selectedVariant.stock_quantity === 0 ? "Out of Stock" : "Add to Cart") 
              : "Please make a selection"
            }
          </Button>

          {/* --- UPDATED: New "Visible yet Subtle" Ingredients Button --- */}
          <button 
            onClick={() => setIsIngredientsOpen(true)}
            className="group w-full flex items-center justify-center gap-2 rounded-md py-3 text-sm text-muted-foreground transition-all hover:bg-muted/50 hover:text-foreground"
          >
            <Info className="h-4 w-4 text-muted-foreground group-hover:text-brand" />
            <span className="border-b border-dashed border-muted-foreground/50 pb-0.5 group-hover:border-brand group-hover:text-brand">
                View full ingredients & benefits
            </span>
          </button>
        </div>
      </div>

      {/* --- Rich Content Sections (Unchanged) --- */}
      <div className="mx-auto max-w-4xl mt-16 space-y-12">
        <section>
          <h2 className="font-heading text-3xl text-center mb-8">Your Daily Ritual of Calm</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <BenefitItem icon={<Droplet />} title="Soothe Muscles">
              Rich in magnesium, Epsom salts help relieve aches, pains and muscle tension after a long day or workout.
            </BenefitItem>
            <BenefitItem icon={<Leaf />} title="Promote Restful Sleep">
              The calming properties of essential oils and magnesium prepare your body and mind for a deeper, more restorative sleep.
            </BenefitItem>
            <BenefitItem icon={<Sparkle />} title="Detoxify & Soften">
              Himalayan Pink Salt helps draw out toxins while natural minerals soften your skin, leaving it feeling silky and refreshed.
            </BenefitItem>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 rounded-lg bg-muted/30 p-8">
          <div>
            <h3 className="font-heading text-2xl mb-4">How to Use</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex gap-2"><Check className="h-5 w-5 shrink-0 text-brand" /> <span>Add a generous handful (about 1/4 cup) to a warm, running bath.</span></li>
              <li className="flex gap-2"><Check className="h-5 w-5 shrink-0 text-brand" /> <span>Swirl the water to help the salts dissolve.</span></li>
              <li className="flex gap-2"><Check className="h-5 w-5 shrink-0 text-brand" /> <span>Soak for at least 20 minutes to absorb the full mineral benefits.</span></li>
              <li className="flex gap-2"><Check className="h-5 w-5 shrink-0 text-brand" /> <span>Relax, breathe deeply and let your stress melt away.</span></li>
            </ul>
          </div>
          <div className="border-l border-border/50 pl-0 md:pl-12 pt-8 md:pt-0">
            <h3 className="font-heading text-2xl mb-6">The Standard</h3>
            <div className="space-y-6">
                <div className="flex gap-4">
                    <Flame className="text-brand shrink-0" />
                    <div>
                        <h4 className="font-semibold text-foreground">Handcrafted in Small Batches</h4>
                        <p className="text-sm text-muted-foreground mt-1">Made fresh to ensure potency of the essential oils.</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <ShieldCheck className="text-brand shrink-0" />
                    <div>
                        <h4 className="font-semibold text-foreground">100% Natural Origins</h4>
                        <p className="text-sm text-muted-foreground mt-1">No synthetic fragrances, artificial dyes, or anti-caking agents.</p>
                    </div>
                </div>
            </div>
            </div>
        </section>
      </div>

      <IngredientsModal 
        isOpen={isIngredientsOpen} 
        onClose={() => setIsIngredientsOpen(false)}
        flavor={selectedFlavor}
      />
    </>     
  )
}