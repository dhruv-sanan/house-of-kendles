import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database.types'

/**
 * Creates a Supabase client for use in browser/client components.
 * This client is configured with the Database type for full type safety.
 * 
 * @returns A typed Supabase browser client
 * 
 * @example
 * ```tsx
 * 'use client'
 * import { createClient } from '@/utils/supabase/client'
 * 
 * const supabase = createClient()
 * const { data } = await supabase.from('customers').select('*')
 * ```
 */
export function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error(
            'Missing Supabase environment variables. Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local'
        )
    }

    return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}
