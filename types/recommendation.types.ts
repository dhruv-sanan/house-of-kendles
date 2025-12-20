/**
 * Recommendation System Types
 */

export type RecommendationType = 'impulse' | 'paired'
export type ClickLocation = 'item_page_paired' | 'cart_impulse'
export type SocialProofBadge = 'bestseller' | 'popular' | 'great_deal' | null

/**
 * Standardized shape for recommended products returned by query functions
 */
export interface RecommendedProduct {
    id: number
    name: string
    slug: string
    image: string
    price: number
    variantId: number
    size: string | null
    flavor: string | null
    category: string | null
    socialProofBadge: SocialProofBadge
    stockQuantity: number
}

/**
 * Parameters for tracking recommendation interactions
 */
export interface TrackingParams {
    sessionId: string
    recommendedProductId: number
    recommendedVariantId: number
    clickLocation: ClickLocation
    sourceProductId?: number
    sourcePageUrl?: string
}

/**
 * Category pairing configuration for smart suggestions
 */
export interface CategoryPairing {
    sourceCategories: string[]
    targetCategories: string[]
    minPrice?: number
    maxPrice?: number
}

/**
 * Analytics aggregates
 */
export interface RecommendationAnalytics {
    totalClicks: number
    totalAdds: number
    conversionRate: number
    clicksByLocation: Record<ClickLocation, number>
    addsByLocation: Record<ClickLocation, number>
}
