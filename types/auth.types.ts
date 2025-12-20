import type { User } from '@supabase/supabase-js'
import type { Tables } from './database.types'

/**
 * Re-export of the Supabase User type for convenience
 */
export type AuthUser = User

/**
 * Combined type for a user with their associated customer record
 */
export type UserWithCustomer = {
    /** The authenticated Supabase user */
    user: AuthUser
    /** The customer record linked to this user, or null if not found */
    customer: Tables<'customers'> | null
}

/**
 * Auth session state including loading status
 * Used by the AuthProvider context
 */
export type AuthSession = {
    /** The authenticated user, or null if not logged in */
    user: AuthUser | null
    /** The customer record for this user, or null if not found or not logged in */
    customer: Tables<'customers'> | null
    /** Whether the auth state is still being determined */
    loading: boolean
}

/**
 * The value provided by AuthContext
 * Includes session data and auth actions
 */
export type AuthContextValue = AuthSession & {
    /** Sign out the current user */
    signOut: () => Promise<void>
}
