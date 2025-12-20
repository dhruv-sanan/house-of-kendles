import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/utils/supabase/server'

/**
 * OAuth callback handler
 * Exchanges the auth code for a session and creates customer record if needed
 */
export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const redirectTo = requestUrl.searchParams.get('redirect') || '/'
    const origin = requestUrl.origin

    if (code) {
        try {
            const supabase = await createClient()

            // Exchange the code for a session
            const { data: { session }, error: authError } = await supabase.auth.exchangeCodeForSession(code)

            if (authError) {
                console.error('[Auth Callback] Auth error:', authError)
                return NextResponse.redirect(
                    `${origin}/sign-in?error=${encodeURIComponent(authError.message)}`
                )
            }

            if (session?.user) {
                const user = session.user
                console.log('[Auth Callback] User authenticated:', user.id)

                // Check if customer already exists for this user
                const { data: existingCustomer, error: fetchError } = await supabase
                    .from('customers')
                    .select('id')
                    .eq('user_id', user.id)
                    .single()

                if (fetchError && fetchError.code !== 'PGRST116') {
                    // Real error (not "not found")
                    console.error('[Auth Callback] Error checking customer:', fetchError)
                }

                if (!existingCustomer) {
                    // Create new customer record with basic info from Google
                    const userName = user.user_metadata?.full_name ||
                        user.user_metadata?.name ||
                        'Customer'
                    const userEmail = user.email || ''

                    console.log('[Auth Callback] Creating customer for:', userName, userEmail)

                    const { data: newCustomer, error: createError } = await supabase
                        .from('customers')
                        .insert({
                            user_id: user.id,
                            name: userName,
                            email: userEmail,
                            // phone and address will be updated during checkout
                        })
                        .select('id')
                        .single()

                    if (createError) {
                        console.error('[Auth Callback] Error creating customer:', createError)
                        // Don't fail auth - customer can be created later during checkout
                    } else {
                        console.log('[Auth Callback] Customer created:', newCustomer?.id)
                    }
                } else {
                    console.log('[Auth Callback] Customer already exists:', existingCustomer.id)
                }
            }

            // Redirect to the intended page
            return NextResponse.redirect(`${origin}${redirectTo}`)
        } catch (error) {
            console.error('[Auth Callback] Unexpected error:', error)
            return NextResponse.redirect(
                `${origin}/sign-in?error=${encodeURIComponent('An unexpected error occurred')}`
            )
        }
    }

    // No code provided, redirect to sign-in
    return NextResponse.redirect(`${origin}/sign-in?error=${encodeURIComponent('No authorization code provided')}`)
}
