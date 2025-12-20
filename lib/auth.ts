import { createClient } from '@/utils/supabase/server'
import type { AuthUser, UserWithCustomer } from '@/types/auth.types'
import type { Tables } from '@/types/database.types'

/**
 * Error thrown when authentication is required but user is not authenticated
 */
export class AuthenticationError extends Error {
    constructor(message = 'Authentication required') {
        super(message)
        this.name = 'AuthenticationError'
    }
}

/**
 * Get the current authenticated user from the server-side Supabase client
 * 
 * @returns The authenticated user or null if not authenticated
 * 
 * @example
 * ```tsx
 * // In a Server Component
 * import { getCurrentUser } from '@/lib/auth'
 * 
 * export default async function ProfilePage() {
 *   const user = await getCurrentUser()
 *   if (!user) redirect('/sign-in')
 *   // ...
 * }
 * ```
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
    try {
        const supabase = await createClient()
        const { data: { user }, error } = await supabase.auth.getUser()

        if (error || !user) {
            return null
        }

        return user
    } catch (error) {
        console.error('Error getting current user:', error)
        return null
    }
}

/**
 * Get the current authenticated user along with their customer record
 * 
 * @returns Object containing user and customer, or null values if not authenticated
 * 
 * @example
 * ```tsx
 * // In a Server Component
 * import { getCurrentUserWithCustomer } from '@/lib/auth'
 * 
 * export default async function DashboardPage() {
 *   const { user, customer } = await getCurrentUserWithCustomer()
 *   if (!user) redirect('/sign-in')
 *   
 *   return <div>Welcome, {customer?.name}</div>
 * }
 * ```
 */
export async function getCurrentUserWithCustomer(): Promise<{
    user: AuthUser | null
    customer: Tables<'customers'> | null
}> {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return { user: null, customer: null }
        }

        // Fetch customer record
        const { data: customer, error: customerError } = await supabase
            .from('customers')
            .select('*')
            .eq('user_id', user.id)
            .single()

        if (customerError && customerError.code !== 'PGRST116') {
            console.error('Error fetching customer:', customerError)
        }

        return { user, customer: customer ?? null }
    } catch (error) {
        console.error('Error getting user with customer:', error)
        return { user: null, customer: null }
    }
}

/**
 * Require authentication for server actions or protected operations
 * Throws AuthenticationError if user is not authenticated
 * 
 * @returns The authenticated user and customer record
 * @throws AuthenticationError if not authenticated
 * 
 * @example
 * ```ts
 * // In a Server Action
 * 'use server'
 * import { requireAuth } from '@/lib/auth'
 * 
 * export async function createOrder(formData: FormData) {
 *   const { user, customer } = await requireAuth()
 *   // User is guaranteed to be authenticated here
 *   // ...
 * }
 * ```
 */
export async function requireAuth(): Promise<UserWithCustomer> {
    const { user, customer } = await getCurrentUserWithCustomer()

    if (!user) {
        throw new AuthenticationError()
    }

    return { user, customer }
}
