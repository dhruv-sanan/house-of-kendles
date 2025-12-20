'use server'

import { createClient } from '@/utils/supabase/server'
import type { ClickLocation } from '@/types/recommendation.types'

export interface TrackClickParams {
    sessionId: string
    recommendedProductId: number
    recommendedVariantId: number
    clickLocation: ClickLocation
    sourceProductId?: number
    sourcePageUrl?: string
}

/**
 * Track when a user clicks on a recommendation
 * Returns the click record ID for later updating if added to cart
 */
export async function trackRecommendationClick(params: TrackClickParams): Promise<number | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('recommendation_clicks')
        .insert({
            session_id: params.sessionId,
            recommended_product_id: params.recommendedProductId,
            recommended_variant_id: params.recommendedVariantId,
            click_location: params.clickLocation,
            source_product_id: params.sourceProductId,
            source_page_url: params.sourcePageUrl,
        })
        .select('id')
        .single()

    if (error) {
        console.error('Error tracking recommendation click:', error)
        return null
    }

    return data.id
}

/**
 * Update a click record when the recommended item is added to cart
 */
export async function trackRecommendationAddToCart(clickId: number): Promise<boolean> {
    const supabase = await createClient()

    const { error } = await supabase
        .from('recommendation_clicks')
        .update({
            added_to_cart: true,
            added_at: new Date().toISOString(),
        })
        .eq('id', clickId)

    if (error) {
        console.error('Error updating recommendation click:', error)
        return false
    }

    return true
}

/**
 * Find a recent click record for a session and variant
 * Used when adding to cart directly without a stored click ID
 */
export async function findRecentClick(
    sessionId: string,
    variantId: number
): Promise<number | null> {
    const supabase = await createClient()

    // Look for clicks in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()

    const { data, error } = await supabase
        .from('recommendation_clicks')
        .select('id')
        .eq('session_id', sessionId)
        .eq('recommended_variant_id', variantId)
        .eq('added_to_cart', false)
        .gte('clicked_at', oneHourAgo)
        .order('clicked_at', { ascending: false })
        .limit(1)
        .single()

    if (error || !data) return null
    return data.id
}
