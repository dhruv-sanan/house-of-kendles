'use client'

import { useState, useEffect, useTransition, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/footer'
import { useCart } from '@/lib/cart'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { createOrderFromCart } from '@/app/actions/orders'
import { addAddress, getAddresses, getCustomerData } from '@/app/actions/addresses'
import { AddressSelector } from '@/components/address-selector'
import { AddressSelectionModal } from '@/components/address-selection-modal'
import { toast } from 'sonner'
import { Tag, Loader2, MapPin, ChevronDown, ShoppingBag } from 'lucide-react'
import type { Address } from '@/types/address.types'
import Link from 'next/link'
import Image from 'next/image'

export default function CheckoutPage() {
  const { cart, total, subtotal, discount, appliedCoupon, clear } = useCart()
  const { user, customer, loading: authLoading } = useAuth()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Address state
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | undefined>()
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true)
  const [addressesFetched, setAddressesFetched] = useState(false)

  // Form state for guest/manual entry
  const [useManualAddress, setUseManualAddress] = useState(false)
  const [phone, setPhone] = useState('')
  const [phoneError, setPhoneError] = useState('')

  // Pincode lookup state
  const [pincode, setPincode] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [isLoadingPincode, setIsLoadingPincode] = useState(false)

  // Fetch addresses using client-side Supabase
  const fetchAddresses = useCallback(async () => {
    if (addressesFetched) return

    // If no user after auth loading is done, show manual entry
    if (!authLoading && !user) {
      setIsLoadingAddresses(false)
      setUseManualAddress(true)
      setAddressesFetched(true)
      return
    }

    // Still loading auth, wait
    if (authLoading) return

    try {
      const addressData = await getAddresses()

      if (addressData && addressData.length > 0) {
        setAddresses(addressData)
        // Auto-select default address
        const defaultAddress = addressData.find((a: Address) => a.is_default)
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id)
        } else {
          setSelectedAddressId(addressData[0].id)
        }
      } else {
        setUseManualAddress(true)
      }
    } catch (error) {
      console.error('Error fetching addresses:', error)
      setUseManualAddress(true)
    } finally {
      setIsLoadingAddresses(false)
      setAddressesFetched(true)
    }
  }, [user, authLoading, addressesFetched])

  // Fetch addresses when auth state is ready
  useEffect(() => {
    fetchAddresses()
  }, [fetchAddresses])

  // Timeout fallback to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoadingAddresses) {
        console.warn('Address loading timeout - showing manual entry')
        setIsLoadingAddresses(false)
        setUseManualAddress(true)
      }
    }, 5000)

    return () => clearTimeout(timeout)
  }, [isLoadingAddresses])

  // Pre-fill phone from customer using server action
  useEffect(() => {
    const fetchCustomerPhone = async () => {
      if (!user || phone) return

      try {
        const customerData = await getCustomerData()
        if (customerData?.phone) {
          console.log('[Checkout] Prefilling phone from customer:', customerData.phone)
          setPhone(customerData.phone)
        }
      } catch (error) {
        console.error('Error fetching customer phone:', error)
      }
    }

    fetchCustomerPhone()
  }, [user, phone])

  // Handle Pincode Lookup
  useEffect(() => {
    if (pincode.length === 6) {
      setIsLoadingPincode(true)
      fetch(`https://api.postalpincode.in/pincode/${pincode}`)
        .then((res) => res.json())
        .then((data) => {
          if (data[0].Status === 'Success') {
            const details = data[0].PostOffice[0]
            setCity(details.District)
            setState(details.State)
          } else {
            toast.error('Invalid pincode')
            setCity('')
            setState('')
          }
        })
        .catch(() => {
          // Silent fail - allow manual entry
        })
        .finally(() => setIsLoadingPincode(false))
    }
  }, [pincode])

  // Handle Phone Validation
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10)
    setPhone(val)
    if (val.length > 0 && val.length < 10) {
      setPhoneError('Mobile number must be 10 digits')
    } else {
      setPhoneError('')
    }
  }

  const handlePlaceOrder = async (formData: FormData) => {
    console.log('[Checkout] Place order clicked')

    if (phone.length !== 10) {
      setPhoneError('Please enter a valid 10-digit mobile number')
      toast.error('Please enter a valid 10-digit mobile number')
      return
    }

    startTransition(async () => {
      try {
        console.log('[Checkout] Starting order placement')
        console.log('[Checkout] Use manual address:', useManualAddress)
        console.log('[Checkout] Selected address ID:', selectedAddressId)

        let addressIdToUse = selectedAddressId

        // If using manual address entry, create the address first
        if (useManualAddress && user) {
          console.log('[Checkout] Creating new address from manual entry')

          const street = formData.get('address') as string
          const manualPincode = formData.get('pincode') as string

          console.log('[Checkout] Address data:', { street, city, state, manualPincode })

          if (!street || !city || !state || !manualPincode) {
            const missing = []
            if (!street) missing.push('street address')
            if (!city) missing.push('city')
            if (!state) missing.push('state')
            if (!manualPincode) missing.push('pincode')

            const errorMsg = `Please fill in: ${missing.join(', ')}`
            console.error('[Checkout] Missing address fields:', missing)
            toast.error(errorMsg)
            return
          }

          try {
            console.log('[Checkout] Creating address via server action')
            console.log('[Checkout] Address data:', {
              street: street,
              city: city,
              state: state,
              zip_code: manualPincode,
              label: 'home',
              is_default: addresses.length === 0,
            })

            const result = await addAddress({
              street: street,
              city: city,
              state: state,
              zip_code: manualPincode,
              label: 'home',
              is_default: addresses.length === 0,
            })

            console.log('[Checkout] addAddress result:', result)

            if (!result.success || !result.address) {
              console.error('[Checkout] Address creation failed:', result.error)
              toast.error(result.error || 'Failed to save address')
              return
            }

            addressIdToUse = result.address.id
            console.log('[Checkout] Address created successfully:', result.address.id)
          } catch (error) {
            console.error('[Checkout] Exception creating address:', error)
            toast.error('Failed to save delivery address. Please try again.')
            return
          }
        }

        // Add delivery address ID to form data
        if (addressIdToUse) {
          formData.set('delivery_address_id', addressIdToUse)
          console.log('[Checkout] Using address ID:', addressIdToUse)
        } else {
          console.warn('[Checkout] No address ID available')
        }

        console.log('[Checkout] Calling createOrderFromCart')
        const result = await createOrderFromCart(cart.items, formData)
        console.log('[Checkout] Order creation result:', result)

        if (result.success && result.orderUid) {
          console.log('[Checkout] Order placed successfully:', result.orderUid)
          clear()
          toast.success('Order placed successfully!')
          router.push(`/order/${result.orderUid}`)
        } else {
          console.error('[Checkout] Order creation failed:', result.error)
          toast.error(result.error || 'Failed to place order. Please try again.')
        }
      } catch (error) {
        console.error('[Checkout] Unexpected error in handlePlaceOrder:', error)
        toast.error('An unexpected error occurred. Please try again.')
      }
    })
  }

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId)

  // Empty cart state
  if (cart.items.length === 0) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-3xl px-4 py-20 min-h-screen text-center">
          <ShoppingBag className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h1 className="font-heading text-2xl text-brand-900 mb-2">Your cart is empty</h1>
          <p className="text-gray-500 mb-6">Add some items to your cart to proceed with checkout.</p>
          <Link
            href="/candles"
            className="inline-flex items-center justify-center rounded-lg bg-brand-900 px-6 py-3 text-white font-medium hover:bg-brand transition-colors"
          >
            Browse Candles
          </Link>
        </main>
        <SiteFooter />
      </>
    )
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-10 min-h-screen">
        <h1 className="font-heading text-3xl text-brand-900 mb-8">Checkout</h1>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <form className="space-y-8" action={handlePlaceOrder}>
              {/* Hidden Fields */}
              <input type="hidden" name="couponCode" value={appliedCoupon?.code || ''} />

              {/* Contact Information */}
              <section className="rounded-xl border border-brand/10 bg-white p-6 space-y-4">
                <h2 className="text-lg font-semibold text-brand-900">Contact Information</h2>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      required
                      defaultValue={customer?.name || user?.user_metadata?.full_name || ''}
                      placeholder="John Doe"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      name="email"
                      required
                      defaultValue={customer?.email || user?.email || ''}
                      placeholder="john@example.com"
                      className="mt-1"
                    />
                  </div>
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
                    className={`mt-1 ${phoneError ? 'border-red-500' : ''}`}
                  />
                  {phoneError && <p className="text-xs text-red-500 mt-1">{phoneError}</p>}
                </div>
              </section>

              {/* Delivery Address */}
              <section className="rounded-xl border border-brand/10 bg-white p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-brand-900">Delivery Address</h2>
                  {user && addresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowAddressModal(true)}
                      className="text-sm text-brand-900 hover:text-gold font-medium flex items-center gap-1"
                    >
                      Change
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {isLoadingAddresses || authLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-brand-900" />
                  </div>
                ) : selectedAddress && !useManualAddress ? (
                  // Show selected address
                  <div className="flex items-start gap-3 p-4 rounded-lg border border-brand/20 bg-brand-50/30">
                    <MapPin className="h-5 w-5 text-brand-900 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 capitalize">
                        {selectedAddress.label}
                      </p>
                      <p className="text-sm text-gray-600">{selectedAddress.street}</p>
                      <p className="text-sm text-gray-600">
                        {selectedAddress.city}, {selectedAddress.state} {selectedAddress.zip_code}
                      </p>
                    </div>
                  </div>
                ) : (
                  // Manual address entry
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="pincode">Pincode</Label>
                        <div className="relative">
                          <Input
                            id="pincode"
                            name="pincode"
                            value={pincode}
                            onChange={(e) =>
                              setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))
                            }
                            required={useManualAddress}
                            placeholder="110001"
                            className="mt-1"
                          />
                          {isLoadingPincode && (
                            <div className="absolute right-2 top-3.5">
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={city}
                          readOnly
                          placeholder="Auto-filled"
                          className="mt-1 bg-muted/50"
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          value={state}
                          readOnly
                          placeholder="Auto-filled"
                          className="mt-1 bg-muted/50"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="address">Street Address</Label>
                      <Textarea
                        id="address"
                        name="address"
                        required={useManualAddress}
                        placeholder="House No, Building, Street, Area"
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}

                {!user && (
                  <p className="text-sm text-gray-500">
                    <Link href="/sign-in?redirect=/checkout" className="text-brand-900 font-medium hover:text-gold">
                      Sign in
                    </Link>{' '}
                    to use saved addresses
                  </p>
                )}
              </section>

              {/* Gifting Options */}
              <section className="rounded-xl border border-brand/10 bg-white p-6 space-y-4">
                <h2 className="text-lg font-semibold text-brand-900">Gifting Options</h2>

                <div>
                  <Label htmlFor="giftMessage">Gift Message (optional)</Label>
                  <Textarea
                    id="giftMessage"
                    name="giftMessage"
                    placeholder="Write a heartfelt note to accompany your gift..."
                    className="mt-1"
                  />
                </div>

                <label className="flex items-center gap-3 p-4 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    name="wrap"
                    className="h-4 w-4 rounded text-brand-900 focus:ring-brand-900"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Premium Gift Wrap</p>
                    <p className="text-sm text-gray-500">Beautiful wrapping with ribbon</p>
                  </div>
                  <span className="font-medium text-brand-900">+₹50</span>
                </label>
              </section>

              {/* Submit Button (Mobile) */}
              <div className="lg:hidden">
                <Button
                  type="submit"
                  disabled={isPending || cart.items.length === 0}
                  className="w-full h-14 text-lg bg-brand-900 text-white hover:bg-brand"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    `Place Order • ₹${total}`
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-xl border border-brand/10 bg-white p-6 space-y-4">
              <h2 className="text-lg font-semibold text-brand-900">Order Summary</h2>

              {/* Cart Items Preview */}
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {cart.items.map((item) => (
                  <div key={item.variant_id} className="flex gap-3">
                    <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-gray-100">
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <ShoppingBag className="h-6 w-6 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.size}</p>
                      <p className="text-xs text-gray-500">Qty: {item.qty}</p>
                    </div>
                    <p className="text-sm font-medium">₹{item.price * item.qty}</p>
                  </div>
                ))}
              </div>

              <hr className="border-gray-100" />

              {/* Totals */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                {appliedCoupon && discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      {appliedCoupon.code}
                    </span>
                    <span>-₹{discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold text-brand-900 pt-2 border-t">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>
              </div>

              {/* Submit Button (Desktop) */}
              <div className="hidden lg:block pt-2">
                <Button
                  type="submit"
                  form="checkout-form"
                  disabled={isPending || cart.items.length === 0}
                  onClick={() => {
                    const form = document.querySelector('form')
                    if (form) form.requestSubmit()
                  }}
                  className="w-full h-12 bg-brand-900 text-white hover:bg-brand"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    'Place Order'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Address Selection Modal */}
      <AddressSelectionModal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        onSelect={(addressId) => {
          setSelectedAddressId(addressId)
          setUseManualAddress(false)
        }}
        selectedAddressId={selectedAddressId}
      />

      <SiteFooter />
    </>
  )
}