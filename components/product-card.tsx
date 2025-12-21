"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useCart } from "@/lib/cart"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { ProductWithVariants } from "@/app/_actions/products"
import { useMemo, useState, useEffect } from "react"
import { Loader2, Check, ShoppingBag } from "lucide-react"
import { useSidebar } from "@/components/ui/sidebar"

type ProductCardProps = {
  product: ProductWithVariants
  className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { addItem, cart } = useCart()
  const { toast } = useToast()
  const { setOpen } = useSidebar()
  const [isAdding, setIsAdding] = useState(false)
  const [justAdded, setJustAdded] = useState(false)

  const { lowestPrice, hasMultipleVariants, singleVariant, defaultImageUrl } = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return { lowestPrice: 0, hasMultipleVariants: false, singleVariant: null, defaultImageUrl: "https://res.cloudinary.com/dq077uui5/image/upload/v1766345243/House_of-2_page-0001_pzag8s.jpg" }
    }
    const prices = product.variants.map(v => v.price)
    const firstVariant = product.variants[0];

    return {
      lowestPrice: Math.min(...prices),
      hasMultipleVariants: product.variants.length > 1,
      singleVariant: product.variants.length === 1 ? firstVariant : null,
      defaultImageUrl: firstVariant.image_url || product.image_url || "https://res.cloudinary.com/dq077uui5/image/upload/v1766345243/House_of-2_page-0001_pzag8s.jpg"
    }
  }, [product.variants, product.image_url])

  // Check if this product is already in cart
  const isInCart = useMemo(() => {
    if (singleVariant) {
      return cart.items.some(item => item.variant_id === singleVariant.id)
    }
    return false
  }, [cart.items, singleVariant])

  const handleAdd = async () => {
    if (!singleVariant) return

    setIsAdding(true)
    // Simulate a small network delay for better UX perception
    await new Promise(resolve => setTimeout(resolve, 600))

    addItem({
      variant_id: singleVariant.id,
      product_id: product.id,
      slug: product.slug,
      name: product.name,
      size: singleVariant.size || "Standard",
      price: singleVariant.price,
      image_url: singleVariant.image_url || product.image_url,
    })

    setIsAdding(false)
    setJustAdded(true)

    // Reset the "Just Added" state after a few seconds if they don't click it
    setTimeout(() => setJustAdded(false), 3000)
  }

  const badge = product.variants.some(v => v.is_bestseller) ? "Bestseller" : undefined

  return (
    <Card className={cn("overflow-hidden relative flex flex-col h-full group border-none shadow-md", className)}>
      <CardHeader className="p-0">
        <div className="relative aspect-[4/5] overflow-hidden bg-muted">
          <Link href={`/product/${product.slug}`} aria-label={`View ${product.name}`}>
            <Image
              src={defaultImageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </Link>
          {badge && (
            <span className="absolute left-2 top-2 rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-[10px] font-bold tracking-wider uppercase text-brand-900 shadow-sm">
              {badge}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-3">
        <Link href={`/product/${product.slug}`}>
          <h3 className="font-heading text-lg hover:text-gold transition-colors line-clamp-1">{product.name}</h3>
        </Link>
        <p className="text-sm text-muted-foreground font-light">
          {hasMultipleVariants ? "From " : ""}₹{lowestPrice}
        </p>
      </CardContent>
      <CardFooter className="p-2 pt-0 mt-auto">
        {hasMultipleVariants ? (
          <Link href={`/product/${product.slug}`} className="w-full">
            <Button variant="outline" className="w-full border-brand-900/20 hover:bg-brand-900 hover:text-white transition-all">
              Select Options
            </Button>
          </Link>
        ) : (
          <Button
            className={cn(
              "w-full transition-all duration-300 h-9 text-sm",
              justAdded
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-brand-900 text-white hover:bg-brand-900/90"
            )}
            onClick={justAdded ? () => setOpen(true) : handleAdd}
            disabled={!singleVariant || singleVariant.stock_quantity === 0 || isAdding}
          >
            {isAdding ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : justAdded ? (
              <>
                <Check className="mr-2 h-4 w-4" /> Go to Cart
              </>
            ) : (
              singleVariant?.stock_quantity === 0 ? "Out of Stock" : "Add to Cart"
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}