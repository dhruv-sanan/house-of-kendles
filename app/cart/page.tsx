"use client"

import { useState, useEffect } from "react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/footer"
import { useCart } from "@/lib/cart"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import Image from "next/image"
import { Minus, Plus, Trash2, Tag, ArrowRight, ShoppingBag, Check, ChevronLeft, ChevronRight, Sparkles } from "lucide-react"
import { validateCoupon, getAvailableCoupons, type Coupon } from "@/app/_actions/cartActions"
import { getImpulseRecommendations } from "@/lib/recommendations"
import { useToast } from "@/hooks/use-toast"
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { useSession } from "@/hooks/use-session"
import { trackRecommendationClick, trackRecommendationAddToCart } from "@/lib/recommendation-tracking"
import type { RecommendedProduct } from "@/types/recommendation.types"

export default function CartPage() {
  const { cart, total, subtotal, discount, setQty, remove, applyCoupon, appliedCoupon, addItem } = useCart()
  const { sessionId } = useSession()
  const { toast } = useToast()

  const [couponInput, setCouponInput] = useState("")
  const [isValidating, setIsValidating] = useState(false)
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [recommendations, setRecommendations] = useState<RecommendedProduct[]>([])
  const [recCarouselApi, setRecCarouselApi] = useState<CarouselApi>()
  const [isOfferOpen, setIsOfferOpen] = useState(false)

  // Fetch coupons on mount
  useEffect(() => {
    getAvailableCoupons().then(allCoupons => {
      const allowedCodes = ['WELCOME', 'SAVE50']
      setCoupons(allCoupons.filter(c => allowedCodes.includes(c.code)))
    })
  }, [])

  // Fetch recommendations when cart items change
  useEffect(() => {
    const cartProductIds = cart.items.map(item => item.product_id)
    getImpulseRecommendations(cartProductIds, 8).then(setRecommendations)
  }, [cart.items])

  const handleApplyCoupon = async () => {
    if (!couponInput) return
    setIsValidating(true)
    const res = await validateCoupon(couponInput.toUpperCase(), subtotal)
    setIsValidating(false)

    if (res.success && res.coupon) {
      applyCoupon(res.coupon)
      toast({ title: "Coupon Applied!", description: "Discount added to your cart." })
      setCouponInput("")
      setIsOfferOpen(false)
    } else {
      toast({ title: "Invalid Coupon", description: res.error || "Code not found.", variant: "destructive" })
    }
  }

  const removeCoupon = () => {
    applyCoupon(null)
    toast({ title: "Coupon Removed" })
  }

  const getDiscountedPrice = (price: number) => {
    if (appliedCoupon && appliedCoupon.discount_type === 'percentage') {
      return price - (price * appliedCoupon.discount_value / 100)
    }
    return null
  }

  return (
    <>
      <SiteHeader />
      <main className="min-h-[80vh] bg-surface py-10 px-4 md:px-8">
        <div className="mx-auto max-w-6xl">
          <h1 className="font-heading text-4xl mb-8 text-brand-900">Shopping Cart</h1>

          {cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border text-center">
              <div className="h-20 w-20 bg-muted/50 rounded-full flex items-center justify-center mb-6">
                <ShoppingBag className="h-10 w-10 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-8">Looks like you haven't added anything yet.</p>
              <Button asChild size="lg" className="bg-brand text-white hover:bg-brand-900">
                <Link href="/candles">Start Shopping</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">

              {/* Left Column: Cart Items + Recommendations */}
              <div className="lg:col-span-8 space-y-8">
                {/* Items List */}
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                  <div className="p-6 space-y-8">
                    {cart.items.map((item) => {
                      const finalPrice = getDiscountedPrice(item.price)
                      return (
                        <div key={item.variant_id} className="flex gap-4 md:gap-6 group">
                          <div className="relative h-24 w-24 md:h-32 md:w-32 shrink-0 overflow-hidden rounded-lg bg-muted border">
                            <Image
                              src={item.image_url || "/placeholder.png"}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex flex-1 flex-col justify-between">
                            <div className="flex justify-between items-start">
                              <div>
                                <Link
                                  href={`/product/${item.slug ?? item.product_id}`} // 👈 fallback for old items
                                  className="font-heading text-lg md:text-xl text-brand-900 hover:underline line-clamp-2"
                                >
                                  {item.name}
                                </Link>
                                <p className="text-sm text-muted-foreground mt-1">Size: {item.size}</p>
                              </div>
                              <div className="text-right">
                                {finalPrice ? (
                                  <>
                                    <p className="font-bold text-brand-900">₹{(finalPrice * item.qty).toFixed(0)}</p>
                                    <p className="text-sm text-muted-foreground line-through">₹{item.price * item.qty}</p>
                                  </>
                                ) : (
                                  <p className="font-bold text-brand-900">₹{item.price * item.qty}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-4">
                              <div className="flex items-center border rounded-md h-9 bg-surface">
                                <button
                                  className="px-3 h-full hover:bg-muted text-muted-foreground transition-colors"
                                  onClick={() => item.qty > 1 ? setQty(item.variant_id, item.qty - 1) : remove(item.variant_id)}
                                >
                                  <Minus className="h-3.5 w-3.5" />
                                </button>
                                <span className="w-8 text-center text-sm font-medium">{item.qty}</span>
                                <button
                                  className="px-3 h-full hover:bg-muted text-muted-foreground transition-colors"
                                  onClick={() => setQty(item.variant_id, item.qty + 1)}
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                </button>
                              </div>
                              <button
                                onClick={() => remove(item.variant_id)}
                                className="text-sm text-muted-foreground hover:text-red-600 flex items-center gap-1 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="hidden sm:inline">Remove</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Carousel for Recommendations */}
                {recommendations.length > 0 && (
                  <div className="bg-transparent pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-heading text-2xl text-brand-900 flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-gold" /> Complete Your Ritual
                      </h3>
                      <div className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={() => recCarouselApi?.scrollPrev()} className="h-8 w-8 rounded-full bg-white">
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => recCarouselApi?.scrollNext()} className="h-8 w-8 rounded-full bg-white">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Carousel setApi={setRecCarouselApi} opts={{ align: "start", slidesToScroll: 2 }} className="w-full">
                      <CarouselContent className="-ml-4">
                        {recommendations.map((rec) => (
                          <CarouselItem key={rec.id} className="pl-4 basis-1/2 sm:basis-1/3 lg:basis-1/4">
                            <div className="bg-white rounded-xl border border-transparent hover:border-brand/20 p-3 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                              onClick={async () => {
                                // Track click + conversion
                                if (sessionId) {
                                  const clickId = await trackRecommendationClick({
                                    sessionId,
                                    recommendedProductId: rec.id,
                                    recommendedVariantId: rec.variantId,
                                    clickLocation: "cart_impulse",
                                    sourcePageUrl: "/cart",
                                  })
                                  if (clickId) await trackRecommendationAddToCart(clickId)
                                }

                                addItem({
                                  variant_id: rec.variantId,
                                  product_id: rec.id,
                                  slug: rec.slug,
                                  name: rec.name,
                                  size: rec.size || rec.flavor || "Standard",
                                  price: rec.price,
                                  image_url: rec.image,
                                  qty: 1
                                })
                                toast({ title: "Added to cart!" })
                              }}>
                              <div className="relative aspect-square bg-muted rounded-lg mb-3 overflow-hidden">
                                <Image src={rec.image || "/placeholder.png"} alt={rec.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute bottom-2 right-2 bg-white rounded-full p-1.5 shadow-md opacity-0 translate-y-2 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                                  <Plus className="h-4 w-4 text-brand-900" />
                                </div>
                              </div>
                              <h4 className="font-medium text-sm truncate text-brand-900">{rec.name}</h4>
                              <p className="text-xs text-muted-foreground">₹{rec.price}</p>
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                    </Carousel>
                  </div>
                )}
              </div>

              {/* Right Column: Summary */}
              <div className="lg:col-span-4">
                <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-24">
                  <h3 className="font-heading text-2xl mb-6">Order Summary</h3>

                  {/* Unified Coupon Input */}
                  <div className="mb-6">
                    <label className="text-sm font-medium mb-2 block">Promo Code</label>
                    {appliedCoupon ? (
                      <div className="flex items-center justify-between bg-green-50 border border-green-200 p-3 rounded-md">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2 text-green-800">
                            <Tag className="h-4 w-4" />
                            <span className="font-bold text-sm">{appliedCoupon.code}</span>
                          </div>
                          <span className="text-[10px] text-green-600 ml-6">Applied Successfully</span>
                        </div>
                        <button onClick={removeCoupon} className="text-xs font-medium text-muted-foreground hover:text-red-600 underline">
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input
                            placeholder="Enter code"
                            value={couponInput}
                            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                            className="uppercase pr-20"
                          />
                          {coupons.length > 0 && (
                            <Popover open={isOfferOpen} onOpenChange={setIsOfferOpen}>
                              <PopoverTrigger asChild>
                                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-brand-900 hover:text-gold transition-colors">
                                  View Offers
                                </button>
                              </PopoverTrigger>
                              <PopoverContent align="end" className="w-64 p-0 shadow-xl">
                                <div className="p-3 border-b text-xs font-medium text-muted-foreground bg-muted/30">Available Coupons</div>
                                <div className="p-2 max-h-[200px] overflow-y-auto">
                                  {coupons.map(c => (
                                    <button
                                      key={c.id}
                                      onClick={() => {
                                        setCouponInput(c.code)
                                        setIsOfferOpen(false)
                                      }}
                                      className="w-full flex items-center justify-between p-2 hover:bg-muted rounded-md text-xs transition-colors group"
                                    >
                                      <span className="font-mono font-bold text-brand-900 group-hover:text-brand">{c.code}</span>
                                      <Badge variant="outline" className="text-[10px]">
                                        {c.discount_type === 'percentage' ? `${c.discount_value}% Off` : `₹${c.discount_value} Off`}
                                      </Badge>
                                    </button>
                                  ))}
                                </div>
                              </PopoverContent>
                            </Popover>
                          )}
                        </div>
                        <Button variant="outline" onClick={handleApplyCoupon} disabled={!couponInput || isValidating} className="bg-brand-900 text-white hover:bg-brand-900/90 border-transparent">
                          Apply
                        </Button>
                      </div>
                    )}
                  </div>

                  <Separator className="my-4" />

                  {/* Calculations */}
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>₹{subtotal}</span>
                    </div>
                    {appliedCoupon && (
                      <div className="flex justify-between text-green-600 font-medium">
                        <span>Discount</span>
                        <span>-₹{discount.toFixed(0)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="text-muted-foreground">Calculated at checkout</span>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="flex justify-between items-end mb-6">
                    <span className="font-medium text-lg">Total</span>
                    <span className="font-heading text-3xl text-brand-900">₹{total.toFixed(0)}</span>
                  </div>

                  <Link href="/checkout">
                    <Button size="lg" className="w-full bg-brand text-white hover:bg-brand-900 text-lg h-14 shadow-md">
                      Checkout <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>

                  <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <Check className="h-3 w-3" /> Secure Checkout
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  )
}