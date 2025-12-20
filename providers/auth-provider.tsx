'use client'

import {
    createContext,
    useCallback,
    useEffect,
    useState,
    type ReactNode,
} from 'react'
import { createClient } from '@/utils/supabase/client'
import type { AuthContextValue, AuthUser } from '@/types/auth.types'
import type { Tables } from '@/types/database.types'
import { useRouter } from 'next/navigation'
import { signOutAction } from '@/app/_actions/auth'

/**
 * Auth context providing user and customer state throughout the app
 */
export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

interface AuthProviderProps {
    children: ReactNode
}

/**
 * Auth Provider component that wraps the app and provides auth state
 */
export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<AuthUser | null>(null)
    const [customer, setCustomer] = useState<Tables<'customers'> | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    /**
     * Fetch the customer record for a given user ID
     */
    const fetchCustomer = useCallback(async (userId: string) => {
        try {
            const supabase = createClient()
            const { data, error } = await supabase
                .from('customers')
                .select('*')
                .eq('user_id', userId)
                .single()

            if (error) {
                // No customer record found is not an error
                if (error.code === 'PGRST116') {
                    setCustomer(null)
                    return
                }
                console.error('Error fetching customer:', error)
                setCustomer(null)
                return
            }

            setCustomer(data)
        } catch (error) {
            console.error('Error fetching customer:', error)
            setCustomer(null)
        }
    }, [])

    /**
     * Sign out the current user
     */
    const signOut = useCallback(async () => {
        try {
            // Optimistically clear local state immediately so UI updates
            setUser(null)
            setCustomer(null)

            // Use Server Action to clear cookies and redirect
            await signOutAction()
        } catch (error) {
            console.error('Error signing out:', error)
            // Even if server sign out fails, we want to clear local state
            setUser(null)
            setCustomer(null)
            router.push('/')
        }
    }, [router])

    useEffect(() => {
        const supabase = createClient()
        let isMounted = true

        // Set a timeout to ensure loading state resolves
        const loadingTimeout = setTimeout(() => {
            if (isMounted && loading) {
                console.warn('Auth loading timeout - setting to false')
                setLoading(false)
            }
        }, 5000) // 5 second timeout

        // Get initial session
        const initializeAuth = async () => {
            console.log('[AuthProvider] Initializing auth...')
            try {
                // First try getSession() which uses cookies
                const { data: { session }, error: sessionError } = await supabase.auth.getSession()
                console.log('[AuthProvider] getSession result:', {
                    hasSession: !!session,
                    userId: session?.user?.id,
                    error: sessionError?.message
                })

                if (sessionError) {
                    console.error('[AuthProvider] Error getting session:', sessionError)
                }

                const initialUser = session?.user ?? null
                console.log('[AuthProvider] User from session:', initialUser?.id ?? 'null')

                if (isMounted) {
                    setUser(initialUser)

                    if (initialUser) {
                        console.log('[AuthProvider] Fetching customer for user:', initialUser.id)
                        await fetchCustomer(initialUser.id)
                    } else {
                        console.log('[AuthProvider] No user, skipping customer fetch')
                    }
                }
            } catch (error) {
                console.error('[AuthProvider] Error initializing auth:', error)
                if (isMounted) {
                    setUser(null)
                    setCustomer(null)
                }
            } finally {
                if (isMounted) {
                    console.log('[AuthProvider] Auth initialization complete')
                    setLoading(false)
                }
            }
        }

        initializeAuth()

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (!isMounted) return

                const newUser = session?.user ?? null
                setUser(newUser)

                if (newUser) {
                    await fetchCustomer(newUser.id)
                } else {
                    setCustomer(null)
                }

                // Refresh the page to update server components
                if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
                    router.refresh()
                }
            }
        )

        return () => {
            isMounted = false
            clearTimeout(loadingTimeout)
            subscription.unsubscribe()
        }
    }, [fetchCustomer, router, loading])

    const value: AuthContextValue = {
        user,
        customer,
        loading,
        signOut,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
