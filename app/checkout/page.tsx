"use client"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/footer"
import { useCart } from "@/lib/cart"
import { useRouter } from "next/navigation"
import { useTransition, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { createOrder } from "@/app/_actions/orderActions"
import { useToast } from "@/hooks/use-toast"
import { Tag, Loader2 } from "lucide-react"

export default function CheckoutPage() {
  const { cart, total, subtotal, discount, appliedCoupon, clear } = useCart()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  // State for address fields
  const [pincode, setPincode] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [isLoadingPincode, setIsLoadingPincode] = useState(false)
  const [phone, setPhone] = useState("")
  const [phoneError, setPhoneError] = useState("")

  // Handle Pincode Lookup
  useEffect(() => {
    if (pincode.length === 6) {
      setIsLoadingPincode(true)
      fetch(`https://api.postalpincode.in/pincode/${pincode}`)
        .then((res) => res.json())
        .then((data) => {
          if (data[0].Status === "Success") {
            const details = data[0].PostOffice[0]
            setCity(details.District)
            setState(details.State)
          } else {
            toast({ title: "Invalid Pincode", description: "Could not fetch details.", variant: "destructive" })
            setCity("")
            setState("")
          }
        })
        .catch(() => {
          // Silent fail or manual entry allowed
        })
        .finally(() => setIsLoadingPincode(false))
    }
  }, [pincode, toast])

  // Handle Phone Validation
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "") // Remove non-digits
    if (val.length <= 10) {
      setPhone(val)
      if (val.length > 0 && val.length < 10) {
        setPhoneError("Mobile number must be 10 digits")
      } else {
        setPhoneError("")
      }
    }
  }

  const handlePlaceOrder = async (formData: FormData) => {
    if (phone.length !== 10) {
      setPhoneError("Please enter a valid 10-digit mobile number")
      return
    }

    // Append city/state to address for the backend
    const fullAddress = `${formData.get("address")}, ${city}, ${state} - ${pincode}`
    formData.set("address", fullAddress)

    startTransition(async () => {
      const result = await createOrder(cart.items, formData)

      if (result.success && result.orderUid) {
        clear() 
        router.push(`/order/${result.orderUid}`)
      } else {
        toast({
          title: "Error",
          description: "There was a problem placing your order. Please check your details.",
          variant: "destructive",
        })
      }
    })
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-10 min-h-screen">
        <h1 className="font-heading text-3xl">Checkout</h1>

        <form className="mt-6 grid grid-cols-1 gap-6" action={handlePlaceOrder}>
          {/* --- Hidden Field for Coupon --- */}
          <input type="hidden" name="couponCode" value={appliedCoupon?.code || ""} />

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Contact & Shipping</h2>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" required placeholder="John Doe" />
              </div>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" name="email" required placeholder="john@example.com" />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    name="phone" 
                    value={phone}
                    onChange={handlePhoneChange}
                    required 
                    placeholder="9876543210" 
                    className={phoneError ? "border-red-500" : ""}
                  />
                  {phoneError && <p className="text-xs text-red-500 mt-1">{phoneError}</p>}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <Label htmlFor="pincode">Pincode</Label>
                  <div className="relative">
                    <Input 
                      id="pincode" 
                      name="pincode" 
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      required 
                      placeholder="110001" 
                    />
                    {isLoadingPincode && (
                      <div className="absolute right-2 top-2.5">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-span-1">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" value={city} readOnly placeholder="Auto-filled" className="bg-muted/50" />
                </div>
                <div className="col-span-1">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" value={state} readOnly placeholder="Auto-filled" className="bg-muted/50" />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address Line</Label>
                <Textarea id="address" name="address" required placeholder="House No, Building, Street Area" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Gifting</h2>
            <div>
              <Label htmlFor="giftMessage">Gift Message (optional)</Label>
              <Textarea id="giftMessage" name="giftMessage" placeholder="Write a heartfelt note..." className="mt-1.5" />
            </div>
            <div className="flex items-center gap-2 rounded-lg border p-4 bg-muted/20">
              <input type="checkbox" id="wrap" name="wrap" className="h-4 w-4 accent-brand-900" /> 
              <Label htmlFor="wrap" className="cursor-pointer">Add premium gift wrap (+₹50)</Label>
            </div>
          </div>

          <div className="rounded-lg bg-muted/10 border p-6 space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between text-sm text-green-600">
                <span className="flex items-center gap-2"><Tag className="h-3 w-3" /> Discount ({appliedCoupon.code})</span>
                <span>-₹{discount}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>Total Amount</span>
              <span>₹{total}</span>
            </div>
          </div>

          <Button disabled={isPending || cart.items.length === 0} className="w-full h-12 text-lg bg-brand text-white hover:bg-brand-900">
            {isPending ? "Placing Order..." : "Confirm & Pay"}
          </Button>
        </form>
      </main>
      <SiteFooter />
    </>
  )
}