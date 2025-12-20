import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/database.types'

/**
 * Creates a Supabase client for use in Next.js middleware.
 * This handles session refresh and cookie management.
 * 
 * @param request - The Next.js request object
 * @returns Object containing the Supabase client and a response with updated cookies
 * 
 * @example
 * ```ts
 * // In middleware.ts
 * import { createClient } from '@/utils/supabase/middleware'
 * 
 * export async function middleware(request: NextRequest) {
 *   const { supabase, response } = createClient(request)
 *   const { data: { user } } = await supabase.auth.getUser()
 *   // ... handle auth logic
 *   return response
 * }
 * ```
 */
export function createClient(request: NextRequest) {
    // Create an unmodified response
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error(
            'Missing Supabase environment variables. Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local'
        )
    }

    const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
        cookies: {
            getAll() {
                return request.cookies.getAll()
            },
            setAll(cookiesToSet) {
                // Update cookies on the request
                cookiesToSet.forEach(({ name, value }) =>
                    request.cookies.set(name, value)
                )

                // Create a new response with the updated request
                response = NextResponse.next({
                    request: {
                        headers: request.headers,
                    },
                })

                // Set cookies on the response
                cookiesToSet.forEach(({ name, value, options }) =>
                    response.cookies.set(name, value, options)
                )
            },
        },
    })

    return { supabase, response }
}
