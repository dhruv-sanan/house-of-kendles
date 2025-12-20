"use server"

import { supabase } from "@/lib/supabase/client"
import { notFound } from "next/navigation"

// --- TYPES (product_variants now includes image_url) ---

export type ProductVariant = {
  id: number
  product_id: number
  size: string | null
  price: number
  stock_quantity: number
  is_bestseller: boolean
  image_url: string | null 
  image_urls: string[] | null // <-- ADDED
  flavor: string | null
}

export type ProductWithVariants = {
  id: number
  name: string
  slug: string
  description: string | null
  category: string | null
  image_url: string | null // This is the main/fallback image
  created_at: string
  variants: ProductVariant[]
}


/**
 * Fetches all products with their variants from the database.
 */
export async function getProducts(options: { category?: string; bestseller?: boolean } = {}): Promise<ProductWithVariants[]> {
  let query = supabase
    .from("products")
    .select(`
      id, name, slug, description, category, image_url, created_at,
      variants:product_variants (
        id,
        product_id,
        size,
        price,
        stock_quantity,
        is_bestseller,
        image_url,
        image_urls,
        flavor
      )
    `)

  if (options.category) {
    query = query.eq("category", options.category)
  }
  if (options.bestseller) {
    query = query.filter("variants.is_bestseller", "eq", true)
  }

  const { data, error } = await query.order("name")

  if (error) {
    console.error("Error fetching products:", error)
    return []
  }

  return data.filter(p => p.variants && p.variants.length > 0)
}

/**
 * Fetches a single product and all its variants by its URL SLUG.
 */
export async function getProductBySlug(slug: string): Promise<ProductWithVariants> {
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      variants:product_variants (
        *,
        image_url,
        image_urls,
        flavor
      )
    `)
    .eq("slug", slug)
    .single()
  // ... (rest of function)
  if (error || !data) {
    console.error(`Error fetching product with slug ${slug}:`, error)
    notFound()
  }

  return data
}

/**
 * Fetches details for a single product variant, including the product name.
 */
export async function getProductVariantById(variantId: number) {
  const { data, error } = await supabase
    .from("product_variants")
    .select(`
      id,
      size,
      price,
      stock_quantity,
      is_bestseller,
      image_url, 
      image_urls,
      flavor,
      products ( name )
    `)
    .eq("id", variantId)
    .single()

  if (error || !data) {
    console.error(`Error fetching variant ${variantId}:`, error)
    return null
  }

  return {
      ...data,
      productName: data.products?.name ?? 'Unknown Product',
  }
}