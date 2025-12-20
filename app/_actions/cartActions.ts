"use server"

import { supabase } from "@/lib/supabase/client"

export type Coupon = {
  id: number
  code: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  min_order_value: number
  is_active: boolean
}

export async function validateCoupon(code: string, cartTotal: number) {
  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .eq("code", code)
    .eq("is_active", true)
    .single()

  if (error || !data) {
    return { success: false, error: "Invalid coupon code." }
  }

  if (cartTotal < data.min_order_value) {
    return { success: false, error: `Add items worth ₹${data.min_order_value - cartTotal} more to apply this coupon.` }
  }

  return { success: true, coupon: data as Coupon }
}

export async function getAvailableCoupons() {
  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .eq("is_active", true)
    .order("min_order_value", { ascending: true })

  if (error) {
    console.error("Error fetching coupons:", error)
    return []
  }
  return data as Coupon[]
}

// Fetch some low-cost items for the "You might also like" section
export async function getRecommendedItems() {
  const { data, error } = await supabase
    .from("products")
    .select(`
      id, name, slug, image_url,
      variants:product_variants (
        id, price, size, stock_quantity, image_url
      )
    `)
    .limit(5)
    // Ideally, you'd have a 'is_recommended' flag or sort by popularity/price
    // For now, we'll just grab 5 items.

  if (error) return []
  
  // Transform to a simpler structure for the cart carousel
  return data.map(p => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.variants[0]?.price,
    image: p.variants[0]?.image_url || p.image_url,
    variantId: p.variants[0]?.id
  })).filter(p => p.price && p.variantId)
}