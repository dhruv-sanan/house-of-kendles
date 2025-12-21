"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart"
import { Check, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

// Define a minimal type for the product to avoid complex imports if not needed, 
// or import the real type. We'll replicate the structure we need.
type AddKitToCartButtonProps = {
  product?: {
    id: number
    name: string
    slug: string
    price: number
    image_url: string | null
    variant_id?: number
  } | null
}

export function AddKitToCartButton({ product }: AddKitToCartButtonProps) {
  const { addItem } = useCart()
  const { toast } = useToast()
  const [isAdding, setIsAdding] = useState(false)
  const [justAdded, setJustAdded] = useState(false)

  const handleAdd = async () => {
    setIsAdding(true)
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 600))

    // Use provided product or fallback to hardcoded details if product fetch failed/wasn't provided
    // Ideally this should always match a real DB record.
    const productToAdd = product || {
      id: 99999, // Placeholder ID
      variant_id: 99999, // Placeholder Variant ID
      slug: "diy-candle-kit",
      name: "DIY Candle Kit",
      price: 550,
      image_url: "/images/decor/tray_cane_tan.jpg", // Fallback image from current page
      size: "Standard"
    }

    addItem({
      variant_id: productToAdd.variant_id || productToAdd.id,
      product_id: productToAdd.id,
      slug: productToAdd.slug,
      name: productToAdd.name,
      size: "Standard",
      price: productToAdd.price,
      image_url: productToAdd.image_url || "https://res.cloudinary.com/dq077uui5/image/upload/v1766345243/House_of-2_page-0001_pzag8s.jpg",
    })

    setIsAdding(false)
    setJustAdded(true)
    
    toast({
      title: "Added to cart",
      description: `${productToAdd.name} has been added to your cart.`,
    })

    setTimeout(() => setJustAdded(false), 3000)
  }

  return (
    <Button
      size="lg"
      className={cn(
        "w-full md:w-auto transition-all duration-300 min-w-[160px]",
        justAdded 
          ? "bg-green-600 hover:bg-green-700 text-white" 
          : "bg-brand-900 text-white hover:bg-brand-900/90"
      )}
      onClick={handleAdd}
      disabled={isAdding}
    >
      {isAdding ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : justAdded ? (
        <>
          <Check className="mr-2 h-4 w-4" /> Added
        </>
      ) : (
        "Add Kit to Cart"
      )}
    </Button>
  )
}
