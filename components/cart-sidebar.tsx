"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, ShoppingBag, Tag, ArrowRight, Sparkles, Trash2, ChevronLeft, ChevronRight, TicketPercent, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetDescription,
} from "@/components/ui/sheet"
import { useCart } from "@/lib/cart"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { validateCoupon, getAvailableCoupons, getRecommendedItems, type Coupon } from "@/app/_actions/cartActions"
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel"
import { useSidebar } from "@/components/ui/sidebar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

type RecommendedItem = {
  id: number
  slug: string
  name: string
  price: number
  image: string | null
  variantId: number
}

export function CartSidebar() {
  const { open, setOpen } = useSidebar()
  const { cart, subtotal, total, discount, setQty, remove, addItem, applyCoupon, appliedCoupon } = useCart()
  const { toast } = useToast()
  
  const [couponCode, setCouponCode] = React.useState("")
  const [coupons, setCoupons] = React.useState<Coupon[]>([])
  const [recommendations, setRecommendations] = React.useState<RecommendedItem[]>([])
  const [loading, setLoading] = React.useState(false)
  const [carouselApi, setCarouselApi] = React.useState<CarouselApi>()
  const [isOfferOpen, setIsOfferOpen] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      getAvailableCoupons().then(allCoupons => {
        const allowedCodes = ['WELCOME', 'SAVE50']
        const filtered = allCoupons.filter(c => allowedCodes.includes(c.code))
        setCoupons(filtered)
      })
      getRecommendedItems().then(setRecommendations)
    }
  }, [open])

  const handleApplyCoupon = async (codeToApply: string = couponCode) => {
    if (!codeToApply) return
    setLoading(true)
    const res = await validateCoupon(codeToApply, subtotal)
    setLoading(false)

    if (res.success && res.coupon) {
      applyCoupon(res.coupon)
      toast({ title: "Coupon Applied!", description: "Discount applied successfully." })
      setCouponCode("")
      setIsOfferOpen(false)
    } else {
      toast({ title: "Cannot Apply Coupon", description: res.error, variant: "destructive" })
    }
  }

  const removeCoupon = () => {
    applyCoupon(null)
    toast({ title: "Coupon Removed" })
  }

  const getDiscountedPrice = (price: number) => {
    if (!appliedCoupon) return null
    if (appliedCoupon.discount_type === 'percentage') {
      return price - (price * appliedCoupon.discount_value / 100)
    }
    return null
  }

  const welcomeCoupon = coupons.find(c => c.code === "WELCOME")
  const welcomeProgress = welcomeCoupon ? Math.min(100, (subtotal / welcomeCoupon.min_order_value) * 100) : 0
  const amountToUnlock = welcomeCoupon ? Math.max(0, welcomeCoupon.min_order_value - subtotal) : 0

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
  side="right"
  className="
    w-[70vw]
    sm:max-w-[400px]
    p-0
    flex flex-col
    h-full
    bg-surface/50
    backdrop-blur-xl
    [&>button:first-of-type]:hidden
  "
>

<SheetHeader className="p-4 border-b bg-white/80 backdrop-blur-md z-10">
  <div className="flex items-center justify-between">
    <SheetTitle className="font-heading text-2xl font-semibold text-brand-900">
      Your Bag
    </SheetTitle>

    {/* ✅ explicit, visible close button */}
    <button
      type="button"
      onClick={() => setOpen(false)}
      aria-label="Close cart"
      className="inline-flex h-8 w-8 items-center justify-center rounded-full
                 hover:bg-muted/70 transition-colors"
    >
      <X className="h-4 w-4 text-slate-900" />
    </button>
  </div>

  <SheetDescription className="text-xs text-muted-foreground text-left">
    {cart.items.length} items in your cart
  </SheetDescription>
</SheetHeader>

        {/* ⭐ CHANGED: ScrollArea takes up remaining height and can scroll vertically */}
        <ScrollArea className="flex-1 w-full overflow-y-auto overflow-x-hidden">
          <div className="p-4 pb-5"> {/* ⭐ extra bottom padding so footer doesn’t overlap content */}
            
            {/* 1. Welcome Nudge */}
            {welcomeCoupon && !appliedCoupon && cart.items.length > 0 && (
              <div className="mb-6 bg-white p-4 rounded-xl border border-brand/10 shadow-sm">
                <div className="mb-2 flex justify-between text-xs items-center">
                  <span className="font-medium text-brand-900 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-gold fill-gold" /> 
                    Unlock 10% Off
                  </span>
                  <span className="text-muted-foreground text-[10px] font-medium">
                    {amountToUnlock > 0 ? `Add ₹${amountToUnlock} more` : "Unlocked!"}
                  </span>
                </div>
                <Progress value={welcomeProgress} className="h-1.5 bg-brand/5 [&>div]:bg-gradient-to-r [&>div]:from-gold [&>div]:to-brand" />
              </div>
            )}

            {/* 2. Cart Items */}
            {cart.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="h-20 w-20 bg-muted/30 rounded-full flex items-center justify-center mb-2 animate-in zoom-in duration-300">
                  <ShoppingBag className="h-10 w-10 text-muted-foreground/50" />
                </div>
                <div>
                  <p className="text-lg font-medium text-brand-900">Your bag is empty</p>
                  <p className="text-sm text-muted-foreground mt-1 max-w-[200px] mx-auto">The best scents are just a click away.</p>
                </div>
                <Button
                  variant="default"
                  className="mt-6 bg-brand-900 text-white hover:bg-brand-900/90"
                  onClick={() => setOpen(false)}
                >
                  Start Shopping
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.items.map((item) => {
                  const discountedPrice = getDiscountedPrice(item.price)
                  return (
                    <div
                      key={item.variant_id}
                      className="flex gap-4 p-3 bg-white rounded-xl border border-transparent hover:border-brand/10 transition-colors shadow-sm"
                    >
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted border">
                        <Image
                          src={item.image_url || "/placeholder.png"}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-1 flex-col justify-between py-0.5 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                        <Link
  href={`/product/${item.slug ?? item.product_id}`} // 👈 use slug if present
  onClick={() => setOpen(false)}
  className="font-medium text-sm line-clamp-2 text-brand-900 hover:text-gold transition-colors"
>
  {item.name}
</Link>

                          <div className="text-right shrink-0">
                            {discountedPrice ? (
                              <div className="flex flex-col items-end">
                                <span className="font-semibold text-sm text-brand-900">
                                  ₹{(discountedPrice * item.qty).toFixed(0)}
                                </span>
                                <span className="text-[10px] text-muted-foreground line-through">
                                  ₹{item.price * item.qty}
                                </span>
                              </div>
                            ) : (
                              <span className="font-semibold text-sm text-brand-900">
                                ₹{item.price * item.qty}
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground mb-2">{item.size}</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center border rounded-lg h-7 bg-surface w-24 justify-between overflow-hidden">
                            <button 
                              className="px-2.5 h-full flex items-center hover:bg-muted transition-colors"
                              onClick={() => item.qty > 1 ? setQty(item.variant_id, item.qty - 1) : remove(item.variant_id)}
                            >
                              <Minus className="h-3 w-3 text-muted-foreground" />
                            </button>
                            <span className="text-xs text-center font-medium w-6">{item.qty}</span>
                            <button 
                              className="px-2.5 h-full flex items-center hover:bg-muted transition-colors"
                              onClick={() => setQty(item.variant_id, item.qty + 1)}
                            >
                              <Plus className="h-3 w-3 text-muted-foreground" />
                            </button>
                          </div>
                          <button 
                            onClick={() => remove(item.variant_id)}
                            className="text-[10px] font-medium text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
                          >
                            <Trash2 className="h-3 w-3" /> Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
{cart.items.length > 0 && <Separator className="my-6 bg-brand/5" />}

{/* 3. Recommendations Carousel (Sidebar-safe + tighter on mobile) */}
{recommendations.length > 0 && cart.items.length > 0 && (
  <div className="mb-6">
    <div className="flex items-center justify-between mb-3 px-1">
      <h4 className="font-medium text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
        <Sparkles className="h-3 w-3 text-gold" /> Pairs Well With
      </h4>
      <div className="flex gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-6 w-6 rounded-full bg-white border-brand/10 hover:bg-brand/5"
          onClick={() => carouselApi?.scrollPrev()}
        >
          <ChevronLeft className="h-3 w-3" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-6 w-6 rounded-full bg-white border-brand/10 hover:bg-brand/5"
          onClick={() => carouselApi?.scrollNext()}
        >
          <ChevronRight className="h-3 w-3" />
        </Button>
      </div>
    </div>

    {/* 🔧 full width now, no centering / max-width */}
    <div className="w-full overflow-hidden">
      <Carousel
        setApi={setCarouselApi}
        className="w-full"
        opts={{ align: "start", slidesToScroll: 1, dragFree: true }}
      >
        {/* slightly smaller gap: -ml-1 instead of -ml-2 */}
        <CarouselContent className="-ml-1">
          {recommendations.map((rec) => (
            <CarouselItem
              key={rec.id}
              className="pl-1 basis-1/2 flex-none min-w-0"
            >
              <div
                className="group relative flex flex-col gap-2 cursor-pointer rounded-lg bg-white p-2 border border-transparent hover:border-brand/20 hover:shadow-sm transition-all"
                onClick={() => {
                  addItem({
                    variant_id: rec.variantId,
                    product_id: rec.id,
                    slug: rec.slug,
                    name: rec.name,
                    size: "Standard",
                    price: rec.price,
                    image_url: rec.image,
                    qty: 1,
                  })
                  toast({ title: "Added to cart!" })
                }}
              >
                <div className="relative aspect-square w-full overflow-hidden rounded-md bg-muted">
                  <Image
                    src={rec.image || "/placeholder.png"}
                    alt={rec.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                  <div className="absolute bottom-1 right-1 bg-white/90 backdrop-blur-sm rounded-full p-1 shadow-sm opacity-0 translate-y-2 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <Plus className="h-3 w-3 text-brand-900" />
                  </div>
                </div>
                <div>
                  <h5 className="text-[10px] font-medium line-clamp-2 leading-tight text-brand-900">
                    {rec.name}
                  </h5>
                  <span className="text-[10px] text-muted-foreground font-medium">
                    ₹{rec.price}
                  </span>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  </div>
)}

            {cart.items.length > 0 && <Separator className="my-6 bg-brand/5" />}

            {/* 4. Redesigned Coupon Section */}
            {cart.items.length > 0 && (
              <div className="pb-6">
                <p className="text-sm font-medium text-brand-900 mb-3 flex items-center gap-2">
                  <TicketPercent className="h-4 w-4" /> Discounts
                </p>
                
                {!appliedCoupon ? (
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input 
                        placeholder="Discount Code" 
                        value={couponCode} 
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="uppercase h-10 text-xs font-mono bg-white pr-20 border-dashed focus-visible:border-solid"
                      />
                      {coupons.length > 0 && (
                        <Popover open={isOfferOpen} onOpenChange={setIsOfferOpen}>
                          <PopoverTrigger asChild>
                            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-brand-900 hover:text-gold transition-colors uppercase tracking-wide">
                              View Offers
                            </button>
                          </PopoverTrigger>
                          <PopoverContent align="end" className="w-64 p-0 shadow-xl border-brand/10">
                            <div className="p-3 bg-muted/30 border-b text-xs font-medium text-muted-foreground">
                              Available Coupons
                            </div>
                            <ScrollArea className="max-h-[200px]">
                              <div className="p-2 space-y-1">
                                {coupons.map(c => (
                                  <button
                                    key={c.id}
                                    onClick={() => {
                                      setCouponCode(c.code)
                                      setIsOfferOpen(false)
                                    }}
                                    className="w-full flex flex-col items-start gap-1 p-2 hover:bg-brand/5 rounded-md transition-colors text-left group"
                                  >
                                    <div className="flex items-center justify-between w-full">
                                      <span className="font-bold text-brand-900 text-xs font-mono bg-white border px-1.5 py-0.5 rounded group-hover:border-brand/20">
                                        {c.code}
                                      </span>
                                      <Badge variant="secondary" className="text-[10px] bg-green-50 text-green-700 hover:bg-green-100">
                                        {c.discount_type === 'percentage'
                                          ? `${c.discount_value}% OFF`
                                          : `₹${c.discount_value} OFF`}
                                      </Badge>
                                    </div>
                                    {c.min_order_value > 0 && (
                                      <span className="text-[10px] text-muted-foreground">
                                        Min order: ₹{c.min_order_value}
                                      </span>
                                    )}
                                  </button>
                                ))}
                              </div>
                            </ScrollArea>
                          </PopoverContent>
                        </Popover>
                      )}
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => handleApplyCoupon()} 
                      disabled={loading || !couponCode} 
                      className="h-10 px-4 bg-brand-900 text-white hover:bg-brand-900/90 shrink-0"
                    >
                      {loading ? "..." : "Apply"}
                    </Button>
                  </div>
                ) : (
                  <div className="flex justify-between items-center bg-green-50 p-3 rounded-lg border border-green-100 animate-in fade-in zoom-in-95">
                    <div className="flex flex-col">
                      <span className="flex items-center gap-2 font-bold text-sm text-green-800">
                        <Tag className="h-3.5 w-3.5" /> {appliedCoupon.code}
                      </span>
                      <span className="text-[10px] text-green-600 mt-0.5">
                        Discount Applied Successfully
                      </span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={removeCoupon} 
                      className="h-7 px-2 text-green-700 hover:text-red-600 hover:bg-green-100"
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* 5. Footer */}
        {cart.items.length > 0 && (
          <SheetFooter className="border-t p-5 bg-white z-20 shadow-[0_-4px_20px_-1px_rgba(0,0,0,0.05)] mt-auto flex-col space-y-4 sm:space-y-4 sm:flex-col sm:space-x-0">
            <div className="space-y-2 text-sm w-full">
              <div className="flex justify-between text-muted-foreground text-xs">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-green-600 font-medium text-xs">
                  <span>Discount ({appliedCoupon.code})</span>
                  <span>-₹{discount.toFixed(0)}</span>
                </div>
              )}
              <div className="flex justify-between items-end pt-2 border-t border-dashed border-gray-200">
                <span className="font-medium text-brand-900">Total</span>
                <span className="font-heading text-2xl font-bold text-brand-900">₹{total.toFixed(0)}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 w-full">
              <Button
                variant="outline"
                className="h-11 text-xs border-brand-900/20 hover:bg-brand-50 hover:text-brand-900 w-full"
                asChild
              >
                <Link href="/cart" onClick={() => setOpen(false)}>View Cart</Link>
              </Button>
              <Button className="bg-brand-900 hover:bg-brand-900/90 text-white h-11 text-sm shadow-lg w-full" asChild>
                <Link href="/checkout" onClick={() => setOpen(false)}>
                  Checkout <ArrowRight className="ml-2 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}
