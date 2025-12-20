'use server'

import { createClient } from '@/utils/supabase/server'
import type { RecommendedProduct, SocialProofBadge, CategoryPairing } from '@/types/recommendation.types'

// Price thresholds in INR
const IMPULSE_MIN_PRICE = 100
const IMPULSE_MAX_PRICE = 600
const PAIRED_MIN_PRICE = 850

/**
 * Category pairing configuration for smart suggestions
 */
const CATEGORY_PAIRINGS: CategoryPairing[] = [
    // Urli Sets → Other Home Decor
    {
        sourceCategories: ['Home Decor'],
        targetCategories: ['Home Decor'],
        minPrice: PAIRED_MIN_PRICE
    },
    // Candles → Trays, Coasters, Gift Sets
    {
        sourceCategories: ['The Coffee Bar', 'Mood & Quotes', 'Floral Sculptures', 'Spiritual & Wellness'],
        targetCategories: ['Home Decor', 'Gift Sets'],
        minPrice: PAIRED_MIN_PRICE
    },
    // Bath & Wellness → Spiritual Candles, Evil Eye Sets
    {
        sourceCategories: ['Bath & Wellness'],
        targetCategories: ['Spiritual & Wellness', 'Home Decor'],
        minPrice: 350
    },
]

/**
 * Helper to determine social proof badge
 */
function getSocialProofBadge(isBestseller: boolean | null, price: number): SocialProofBadge {
    if (isBestseller) return 'bestseller'
    if (price < 200) return 'great_deal'
    return 'popular'
}

/**
 * Fetch impulse recommendations for cart page
 * Returns 6-8 low-ticket items (₹100-₹600), prioritizing bestsellers
 */
export async function getImpulseRecommendations(
    excludeProductIds: number[] = [],
    limit: number = 8
): Promise<RecommendedProduct[]> {
    const supabase = await createClient()

    // Fetch products with variants in the impulse price range
    const { data: variants, error } = await supabase
        .from('product_variants')
        .select(`
      id,
      price,
      size,
      flavor,
      is_bestseller,
      stock_quantity,
      image_url,
      product_id,
      products!inner (
        id,
        name,
        slug,
        category,
        image_url
      )
    `)
        .gte('price', IMPULSE_MIN_PRICE)
        .lte('price', IMPULSE_MAX_PRICE)
        .gt('stock_quantity', 0)
        .not('product_id', 'in', `(${excludeProductIds.length > 0 ? excludeProductIds.join(',') : '0'})`)
        .order('is_bestseller', { ascending: false })
        .order('price', { ascending: true })
        .limit(limit * 2) // Fetch extra to allow deduplication

    if (error) {
        console.error('Error fetching impulse recommendations:', error)
        return []
    }

    if (!variants || variants.length === 0) return []

    // Deduplicate by product_id (keep first/best variant per product)
    const seenProducts = new Set<number>()
    const results: RecommendedProduct[] = []

    for (const v of variants) {
        if (seenProducts.has(v.product_id) || results.length >= limit) continue
        seenProducts.add(v.product_id)

        const product = v.products as { id: number; name: string; slug: string; category: string | null; image_url: string | null }

        results.push({
            id: product.id,
            name: product.name,
            slug: product.slug || '',
            image: v.image_url || product.image_url || '/placeholder.png',
            price: v.price,
            variantId: v.id,
            size: v.size,
            flavor: v.flavor,
            category: product.category,
            socialProofBadge: getSocialProofBadge(v.is_bestseller, v.price),
            stockQuantity: v.stock_quantity,
        })
    }

    return results
}

/**
 * Fetch paired recommendations for product detail page
 * Returns high-ticket complementary items (₹850+) 
 */
export async function getPairedRecommendations(
    productId: number,
    limit: number = 4
): Promise<RecommendedProduct[]> {
    const supabase = await createClient()

    // 1. First, check for manual mappings in product_recommendations table
    const { data: manualRecs, error: manualError } = await supabase
        .from('product_recommendations')
        .select(`
      recommended_product_id,
      display_order,
      products!product_recommendations_recommended_product_id_fkey (
        id,
        name,
        slug,
        category,
        image_url,
        product_variants (
          id,
          price,
          size,
          flavor,
          is_bestseller,
          stock_quantity,
          image_url
        )
      )
    `)
        .eq('source_product_id', productId)
        .eq('recommendation_type', 'paired')
        .order('display_order', { ascending: true })
        .limit(limit)

    if (manualError) {
        console.error('Error fetching manual paired recommendations:', manualError)
    }

    const results: RecommendedProduct[] = []

    // Process manual mappings
    if (manualRecs && manualRecs.length > 0) {
        for (const rec of manualRecs) {
            const product = rec.products as {
                id: number
                name: string
                slug: string
                category: string | null
                image_url: string | null
                product_variants: Array<{
                    id: number
                    price: number
                    size: string | null
                    flavor: string | null
                    is_bestseller: boolean | null
                    stock_quantity: number
                    image_url: string | null
                }>
            }

            if (!product || !product.product_variants?.length) continue

            // Pick the best variant (bestseller first, then highest price)
            const variant = product.product_variants
                .filter(v => v.stock_quantity > 0)
                .sort((a, b) => {
                    if (a.is_bestseller && !b.is_bestseller) return -1
                    if (!a.is_bestseller && b.is_bestseller) return 1
                    return b.price - a.price
                })[0]

            if (!variant) continue

            results.push({
                id: product.id,
                name: product.name,
                slug: product.slug || '',
                image: variant.image_url || product.image_url || '/placeholder.png',
                price: variant.price,
                variantId: variant.id,
                size: variant.size,
                flavor: variant.flavor,
                category: product.category,
                socialProofBadge: getSocialProofBadge(variant.is_bestseller, variant.price),
                stockQuantity: variant.stock_quantity,
            })
        }
    }

    // 2. If we need more, supplement with smart category-based suggestions
    if (results.length < limit) {
        const smartRecs = await getSmartCategoryPairings(productId, limit - results.length, results.map(r => r.id))
        results.push(...smartRecs)
    }

    return results
}

/**
 * Get smart category-based pairings when manual mappings are insufficient
 */
async function getSmartCategoryPairings(
    productId: number,
    limit: number,
    excludeProductIds: number[]
): Promise<RecommendedProduct[]> {
    const supabase = await createClient()

    // Get source product's category
    const { data: sourceProduct, error: sourceError } = await supabase
        .from('products')
        .select('category')
        .eq('id', productId)
        .single()

    if (sourceError || !sourceProduct?.category) return []

    // Find matching pairing config
    const config = CATEGORY_PAIRINGS.find(p =>
        p.sourceCategories.includes(sourceProduct.category!)
    )

    if (!config) return []

    // Fetch products from target categories
    const excludeList = [...excludeProductIds, productId]

    const { data: variants, error } = await supabase
        .from('product_variants')
        .select(`
      id,
      price,
      size,
      flavor,
      is_bestseller,
      stock_quantity,
      image_url,
      product_id,
      products!inner (
        id,
        name,
        slug,
        category,
        image_url
      )
    `)
        .in('products.category', config.targetCategories)
        .gte('price', config.minPrice || PAIRED_MIN_PRICE)
        .gt('stock_quantity', 0)
        .not('product_id', 'in', `(${excludeList.join(',')})`)
        .order('is_bestseller', { ascending: false })
        .order('price', { ascending: false })
        .limit(limit * 2)

    if (error || !variants) return []

    // Deduplicate by product_id
    const seenProducts = new Set<number>()
    const results: RecommendedProduct[] = []

    for (const v of variants) {
        if (seenProducts.has(v.product_id) || results.length >= limit) continue
        seenProducts.add(v.product_id)

        const product = v.products as { id: number; name: string; slug: string; category: string | null; image_url: string | null }

        results.push({
            id: product.id,
            name: product.name,
            slug: product.slug || '',
            image: v.image_url || product.image_url || '/placeholder.png',
            price: v.price,
            variantId: v.id,
            size: v.size,
            flavor: v.flavor,
            category: product.category,
            socialProofBadge: getSocialProofBadge(v.is_bestseller, v.price),
            stockQuantity: v.stock_quantity,
        })
    }

    return results
}
