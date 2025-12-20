"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart"
import { ProductWithVariants } from "@/app/_actions/products"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

export function EvilEyeProductClient({ product }: { product: ProductWithVariants }) {
  const { addItem } = useCart()
  const { toast } = useToast()

  const [selectedVariantId, setSelectedVariantId] = useState<number>(product.variants[0]?.id || 0)

  const { selectedVariant, stands } = useMemo(() => {
    const stands = product.variants.map(v => ({
      id: v.id,
      name: v.size, // Using 'size' field for stand name
      price: v.price,
      image: v.image_url || product.image_url || "/placeholder.png",
      stock: v.stock_quantity
    }))
    const selectedVariant = product.variants.find(v => v.id === selectedVariantId)
    return { selectedVariant, stands }
  }, [product.variants, selectedVariantId])

  const currentImage = selectedVariant?.image_url || product.image_url || "/placeholder.png"

  const handleAddToCart = () => {
    if (!selectedVariant) return
    addItem({
      variant_id: selectedVariant.id,
      product_id: product.id,
        slug: product.slug,
      name: `${product.name} (${selectedVariant.size})`,
      size: selectedVariant.size || "Standard",
      price: selectedVariant.price,
      image_url: currentImage,
      qty: 1,
    })
    toast({ title: "Added to cart!", description: `${product.name} (${selectedVariant.size})` })
  }

  return (
    <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
      <div className="relative aspect-square w-full overflow-hidden rounded-lg shadow-lg">
        <Image
          src={currentImage}
          alt={product.name}
          width={800}
          height={800}
          className="h-full w-full object-cover transition-opacity duration-300"
          key={currentImage} // Force re-render on image change
        />
      </div>
      <div className="flex flex-col justify-center">
        <h3 className="font-heading text-3xl">{product.name}</h3>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          {product.description}
        </p>
        <p className="mt-4 text-3xl font-light">
          {selectedVariant ? `₹${selectedVariant.price}` : "Select a stand"}
        </p>
        
        <div className="mt-4 space-y-3">
          <Label className="text-sm font-medium">Choose Your Stand:</Label>
          <RadioGroup
            value={String(selectedVariantId)}
            onValueChange={(val) => setSelectedVariantId(Number(val))}
            className="flex flex-wrap gap-3"
          >
            {stands.map((stand) => (
              <Label
                key={stand.id}
                className={cn(
                  "flex cursor-pointer items-center justify-center rounded-md border p-3 text-sm transition-colors",
                  selectedVariantId === stand.id
                    ? "border-brand-900 bg-brand/10 text-brand-900 ring-2 ring-brand/50"
                    : "hover:bg-muted/50"
                )}
              >
                <RadioGroupItem value={String(stand.id)} className="sr-only" />
                {stand.name}
              </Label>
            ))}
          </RadioGroup>
        </div>

        <div className="mt-6">
          <Button
            size="lg"
            className="w-full bg-brand text-primary-foreground hover:bg-brand-900"
            onClick={handleAddToCart}
            disabled={!selectedVariant || selectedVariant.stock_quantity === 0}
          >
            {selectedVariant ? 
              (selectedVariant.stock_quantity === 0 ? "Out of Stock" : "Add to Cart") 
              : "Please make a selection"
            }
          </Button>
        </div>
      </div>
    </div>
  )
}