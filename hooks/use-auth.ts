'use client'

import { useContext } from 'react'
import { AuthContext } from '@/providers/auth-provider'
import type { AuthContextValue } from '@/types/auth.types'

/**
 * Custom hook to access auth state and actions
 * Must be used within an AuthProvider
 * 
 * @returns The auth context value including user, customer, loading state, and signOut function
 * @throws Error if used outside of AuthProvider
 * 
 * @example
 * ```tsx
 * 'use client'
 * import { useAuth } from '@/hooks/use-auth'
 * 
 * function MyComponent() {
 *   const { user, customer, loading, signOut } = useAuth()
 *   
 *   if (loading) return <div>Loading...</div>
 *   if (!user) return <div>Not signed in</div>
 *   
 *   return (
 *     <div>
 *       <p>Welcome, {customer?.name}</p>
 *       <button onClick={signOut}>Sign Out</button>
 *     </div>
 *   )
 * }
 * ```
 */
export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext)

    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }

    return context
}
