"use client"

import useSWR from "swr"
import type { Coupon } from "@/app/_actions/cartActions"

export type CartItem = {
  variant_id: number
  product_id: number
  slug: string
  name: string
  size: string
  price: number
  image_url: string | null
  qty: number
}

export type Cart = { 
  items: CartItem[] 
  coupon?: Coupon | null // Add coupon to cart state
}

const KEY = "hok-cart"

function load(): Cart {
  if (typeof window === "undefined") return { items: [], coupon: null }
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Cart) : { items: [], coupon: null }
  } catch {
    return { items: [], coupon: null }
  }
}

function save(cart: Cart) {
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY, JSON.stringify(cart))
  }
}

export function useCart() {
  const { data, mutate } = useSWR<Cart>(KEY, load, { 
    fallbackData: { items: [], coupon: null } 
  })

  function addItem(item: Omit<CartItem, "qty"> & { qty?: number }) {
    const items = [...(data?.items ?? [])]
    const qtyToAdd = item.qty || 1
    const idx = items.findIndex((i) => i.variant_id === item.variant_id)
    
    if (idx >= 0) {
      items[idx] = { ...items[idx], qty: items[idx].qty + qtyToAdd }
    } else {
      items.push({ ...item, qty: qtyToAdd })
    }
    const next = { ...data, items }
    save(next)
    mutate(next, false)
    
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("cart:add"))
    }
  }

  function setQty(variant_id: number, qty: number) {
    const items = (data?.items ?? []).map((i) => (i.variant_id === variant_id ? { ...i, qty } : i)).filter((i) => i.qty > 0)
    const next = { ...data, items }
    save(next)
    mutate(next, false)
  }

  function remove(variant_id: number) {
    const items = (data?.items ?? []).filter((i) => i.variant_id !== variant_id)
    const next = { ...data, items }
    save(next)
    mutate(next, false)
  }

  function applyCoupon(coupon: Coupon | null) {
    const next = { ...data, coupon: coupon } as Cart
    save(next)
    mutate(next, false)
  }

  function clear() {
    const next = { items: [], coupon: null }
    save(next)
    mutate(next, false)
  }

  const subtotal = (data?.items ?? []).reduce((s, i) => s + i.price * i.qty, 0)
  const count = (data?.items ?? []).reduce((s, i) => s + i.qty, 0)

  // Calculate discount based on persisted coupon
  let discount = 0
  if (data?.coupon) {
    if (data.coupon.min_order_value > subtotal) {
       // Coupon invalid due to total dropping below min value
       // Ideally we might want to auto-remove it or just show 0 discount
       discount = 0
    } else {
       discount = data.coupon.discount_type === 'percentage' 
        ? (subtotal * data.coupon.discount_value) / 100 
        : data.coupon.discount_value
    }
  }
  
  const total = Math.max(0, subtotal - discount)

  return { 
    cart: data!, 
    addItem, 
    clear, 
    subtotal, 
    discount,
    total, 
    count, 
    setQty, 
    remove,
    applyCoupon,
    appliedCoupon: data?.coupon 
  }
}