"use client"

import Image from "next/image"
import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart"
import { ProductWithVariants } from "@/app/_actions/products"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useSidebar } from "@/components/ui/sidebar" // <-- Imported Sidebar hook
import { Loader2, Check } from "lucide-react" // <-- Imported Icons
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { cn } from "@/lib/utils"

export function ProductDetailsClient({ product }: { product: ProductWithVariants }) {
  const { addItem } = useCart()
  const { toast } = useToast()
  const { setOpen } = useSidebar() // <-- Get sidebar controller
  
  // --- NEW: Button Interaction States ---
  const [isAdding, setIsAdding] = useState(false)
  const [justAdded, setJustAdded] = useState(false)
  
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(
    product.variants.length > 0 ? product.variants[0].id : null
  )

  const selectedVariant = useMemo(() => {
    return product.variants.find(v => v.id === selectedVariantId)
  }, [selectedVariantId, product.variants])

  const imageList = useMemo(() => {
    const images: string[] = []
    if (selectedVariant?.image_url) images.push(selectedVariant.image_url)
    if (product.image_url && !images.includes(product.image_url)) images.push(product.image_url)
    if (selectedVariant?.image_urls) {
      selectedVariant.image_urls.forEach(url => {
        if (!images.includes(url)) images.push(url)
      })
    }
    if (images.length === 0) images.push("/placeholder.png")
    return images
  }, [selectedVariant, product.image_url])


  // --- UPDATED: Async Handle Add To Cart ---
  const handleAddToCart = async () => {
    if (!selectedVariant) {
      toast({ title: "Please select an option", variant: "destructive" })
      return
    }

    setIsAdding(true)
    // Simulate a small network delay for better UX perception
    await new Promise(resolve => setTimeout(resolve, 600))

    addItem({
      variant_id: selectedVariant.id,
      product_id: product.id,
      slug: product.slug,
      name: product.name,
      size: selectedVariant.size || "Standard",
      price: selectedVariant.price,
      image_url: imageList[0],
      qty: 1,
    })
    
    setIsAdding(false)
    setJustAdded(true)
    
    toast({ title: "Added to cart!", description: `${product.name} (${selectedVariant.size})` })

    // Reset the "Just Added" state after 3 seconds
    setTimeout(() => setJustAdded(false), 3000)
  }

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      <Carousel className="w-full" opts={{ loop: true }}>
        <CarouselContent>
          {imageList.map((url, index) => (
            <CarouselItem key={index}>
              <div className="relative aspect-[4/3] overflow-hidden rounded-md">
                <Image
                  src={url}
                  alt={`${product.name} - view ${index + 1}`}
                  width={960}
                  height={720}
                  className="h-full w-full object-cover"
                  priority={index === 0}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-2" />
        <CarouselNext className="absolute right-2" />
      </Carousel>

      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-3xl">{product.name}</h1>
          <p className="mt-2 text-muted-foreground">{product.description}</p>
        </div>
        
        {product.variants.length > 1 && (
          <div>
            <Label className="text-sm font-medium">Size</Label>
            <RadioGroup
              defaultValue={String(selectedVariantId)}
              onValueChange={(value) => setSelectedVariantId(Number(value))}
              className="mt-2 flex items-center gap-3"
            >
              {product.variants.map((variant) => (
                <div key={variant.id} className="flex items-center">
                  <RadioGroupItem value={String(variant.id)} id={`size-${variant.id}`} />
                  <Label htmlFor={`size-${variant.id}`} className="ml-2 cursor-pointer">
                    {variant.size}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )}

        <div>
          <p className="text-2xl font-medium">₹{selectedVariant?.price || 'N/A'}</p>
          <p className="text-sm text-muted-foreground">
            {selectedVariant && selectedVariant.stock_quantity > 0
              ? `${selectedVariant.stock_quantity} in stock`
              : "Out of stock"}
          </p>
        </div>

        {/* --- UPDATED: Button Logic --- */}
        <Button
          className={cn(
            "w-full md:w-auto min-w-[140px] transition-all duration-300",
            justAdded 
              ? "bg-green-600 hover:bg-green-700 text-white" 
              : "bg-brand text-primary-foreground hover:bg-brand-900"
          )}
          onClick={justAdded ? () => setOpen(true) : handleAddToCart}
          disabled={!selectedVariant || selectedVariant.stock_quantity === 0 || isAdding}
        >
          {isAdding ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : justAdded ? (
            <>
              <Check className="mr-2 h-4 w-4" /> Go to Cart
            </>
          ) : (
            selectedVariant && selectedVariant.stock_quantity > 0 ? "Add to cart" : "Out of Stock"
          )}
        </Button>
      </div>
    </div>
  )
}