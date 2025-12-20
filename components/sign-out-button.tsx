'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { LogOut, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SignOutButtonProps {
    /** Optional class name for styling */
    className?: string
    /** Show icon alongside text */
    showIcon?: boolean
    /** Button variant - defaults to ghost */
    variant?: 'ghost' | 'outline' | 'destructive'
}

/**
 * Sign out button component
 * Handles sign out with loading state and toast notification
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <SignOutButton />
 * 
 * // In a dropdown menu
 * <SignOutButton className="w-full justify-start" variant="ghost" showIcon />
 * ```
 */
export function SignOutButton({
    className,
    showIcon = true,
    variant = 'ghost'
}: SignOutButtonProps) {
    const [isLoading, setIsLoading] = useState(false)
    const { signOut } = useAuth()

    const handleSignOut = async () => {
        setIsLoading(true)

        try {
            await signOut()
            toast.success('Signed out successfully')
        } catch (error) {
            console.error('Sign out error:', error)
            toast.error('Failed to sign out. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Button
            onClick={handleSignOut}
            disabled={isLoading}
            variant={variant}
            className={cn(
                'text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors',
                className
            )}
            aria-label="Sign out"
        >
            {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : showIcon ? (
                <LogOut className="h-4 w-4 mr-2" />
            ) : null}
            {isLoading ? 'Signing out...' : 'Sign Out'}
        </Button>
    )
}
