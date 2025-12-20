"use client"

import { useState } from "react"
import Image from "next/image"
import { ProductWithVariants } from "@/app/_actions/products"
import { Button } from "@/components/ui/button"
import { Check, Plus, ShoppingBag, Trash2 } from "lucide-react"
import { useCart } from "@/lib/cart"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

export function HamperBuilder({ products }: { products: ProductWithVariants[] }) {
  const [selectedItems, setSelectedItems] = useState<ProductWithVariants[]>([])
  const { addItem } = useCart()
  const { toast } = useToast()

  // Calculate totals
  const boxPrice = 200 // Base price for the luxury box packaging
  const itemsTotal = selectedItems.reduce((sum, item) => {
    const price = item.variants[0]?.price || 0
    return sum + price
  }, 0)
  const grandTotal = itemsTotal + boxPrice

  const toggleItem = (product: ProductWithVariants) => {
    if (selectedItems.find(i => i.id === product.id)) {
      setSelectedItems(selectedItems.filter(i => i.id !== product.id))
    } else {
      if (selectedItems.length >= 5) {
        toast({ title: "Box Full", description: "A maximum of 5 items fit in our luxury box.", variant: "destructive" })
        return
      }
      setSelectedItems([...selectedItems, product])
    }
  }

  const handleAddToCart = () => {
    if (selectedItems.length === 0) {
      toast({ title: "Empty Box", description: "Please select at least one item.", variant: "destructive" })
      return
    }

    // In a real app, you might create a special "Hamper" product dynamically.
    // Here, we'll add items individually but you could group them.
    
    // 1. Add the Box itself
    addItem({
      variant_id: 9999, // Reserved ID for Gift Box
      product_id: 9999,
      name: "Luxury Gift Box Packaging",
      slug: "luxury-gift-box-packaging",
      size: "Standard",
      price: boxPrice,
      image_url: "/images/hamper-box.jpg", // Need a placeholder for the empty box
      qty: 1,
    })

    // 2. Add selected contents
    selectedItems.forEach(item => {
      const variant = item.variants[0]
      addItem({
        variant_id: variant.id,
        product_id: item.id,
        slug: item.slug,
        name: `[Hamper Item] ${item.name}`,
        size: variant.size || "Standard",
        price: variant.price,
        image_url: variant.image_url || item.image_url || "/placeholder.png",
        qty: 1,
      })
    })

    toast({ 
      title: "Hamper Added!", 
      description: `Your custom hamper with ${selectedItems.length} items has been added to cart.` 
    })
    setSelectedItems([]) // Reset
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 flex flex-col lg:flex-row gap-8">
      
      {/* Left: Product Grid */}
      <div className="flex-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const variant = product.variants[0]
            const isSelected = selectedItems.some(i => i.id === product.id)
            
            return (
              <div 
                key={product.id} 
                className={`relative group rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-200 overflow-hidden cursor-pointer ${isSelected ? 'ring-2 ring-brand ring-offset-2' : 'hover:shadow-md'}`}
                onClick={() => toggleItem(product)}
              >
                <div className="relative aspect-square w-full overflow-hidden bg-muted">
                  <Image
                    src={variant?.image_url || product.image_url || "/placeholder.png"}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {isSelected && (
                    <div className="absolute inset-0 bg-brand/40 flex items-center justify-center backdrop-blur-[2px]">
                      <div className="bg-white text-brand rounded-full p-2 shadow-lg animate-in zoom-in">
                        <Check className="h-6 w-6" />
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-heading text-lg truncate">{product.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">₹{variant?.price}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Right: Sticky Summary Sidebar */}
      <div className="w-full lg:w-96 shrink-0">
        <div className="sticky top-24 rounded-xl border bg-white shadow-lg overflow-hidden">
          <div className="bg-brand-900 p-6 text-white">
            <h3 className="font-heading text-2xl text-gold">Your Hamper</h3>
            <p className="text-sm text-white/80 mt-1">{selectedItems.length}/5 Items Selected</p>
          </div>
          
          <ScrollArea className="h-[300px] p-6">
            {selectedItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-center space-y-2">
                <ShoppingBag className="h-10 w-10 opacity-20" />
                <p>Your box is empty.</p>
                <p className="text-xs">Select products from the left to fill it up.</p>
              </div>
            ) : (
              <ul className="space-y-4">
                <li className="flex justify-between items-center text-sm">
                   <span className="font-medium flex items-center gap-2">
                     <div className="h-8 w-8 bg-gray-100 rounded flex items-center justify-center">🎁</div>
                     Luxury Gift Box
                   </span>
                   <span>₹{boxPrice}</span>
                </li>
                {selectedItems.map((item) => (
                  <li key={item.id} className="flex justify-between items-center text-sm animate-in slide-in-from-left-2">
                    <span className="truncate max-w-[180px]">{item.name}</span>
                    <div className="flex items-center gap-3">
                      <span>₹{item.variants[0]?.price}</span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleItem(item); }}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </ScrollArea>

          <div className="border-t p-6 bg-muted/20">
            <div className="flex justify-between items-end mb-6">
              <span className="text-muted-foreground">Total</span>
              <span className="text-2xl font-bold text-brand-900">₹{grandTotal}</span>
            </div>
            <Button 
              className="w-full bg-gold text-brand-900 hover:bg-brand-900 hover:text-gold h-12 text-lg font-semibold transition-all"
              disabled={selectedItems.length === 0}
              onClick={handleAddToCart}
            >
              Add Hamper to Cart
            </Button>
          </div>
        </div>
      </div>

    </div>
  )
}