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

/**
 * Fetch aggregated analytics data for admin dashboard
 */
export async function getRecommendationAnalytics() {
    const supabase = await createClient()

    // Fetch all clicks for aggregation
    const { data: clicks, error } = await supabase
        .from('recommendation_clicks')
        .select(`
            *,
            recommended_product:products!recommended_product_id(id, name)
        `)
        .order('clicked_at', { ascending: false })

    if (error) {
        console.error('Error fetching analytics:', error)
        return {
            totalClicks: 0,
            impulseClicks: 0,
            pairedClicks: 0,
            totalConversions: 0,
            conversionRate: 0,
            topProducts: []
        }
    }

    const totalClicks = clicks.length
    const impulseClicks = clicks.filter(c => c.click_location === 'cart_impulse').length
    const pairedClicks = clicks.filter(c => c.click_location === 'item_page_paired').length
    const totalConversions = clicks.filter(c => c.added_to_cart).length
    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0

    // Aggregate by product
    const productStats = new Map<number, { name: string; clicks: number; conversions: number }>()

    clicks.forEach(click => {
        const pid = click.recommended_product_id
        if (!productStats.has(pid)) {
            productStats.set(pid, {
                name: click.recommended_product?.name || `Product #${pid}`,
                clicks: 0,
                conversions: 0
            })
        }

        const stats = productStats.get(pid)!
        stats.clicks++
        if (click.added_to_cart) stats.conversions++
    })

    const topProducts = Array.from(productStats.values())
        .sort((a, b) => b.conversions - a.conversions || b.clicks - a.clicks)
        .slice(0, 5)

    return {
        totalClicks,
        impulseClicks,
        pairedClicks,
        totalConversions,
        conversionRate,
        topProducts
    }
}
