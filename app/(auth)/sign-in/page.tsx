import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { SignInContent } from '@/components/sign-in-content'

export const metadata = {
    title: 'Sign In | House of Kendles',
    description: 'Sign in to your House of Kendles account to manage orders and save your preferences.',
}

interface SignInPageProps {
    searchParams: Promise<{ redirect?: string; error?: string }>
}

/**
 * Sign-in page - Server Component
 * Checks if user is already authenticated and redirects if so.
 */
export default async function SignInPage({ searchParams }: SignInPageProps) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const params = await searchParams
    const redirectTo = params.redirect || '/'
    const error = params.error

    // If user is already authenticated, redirect to intended page
    if (user) {
        redirect(redirectTo)
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-white via-brand-50/30 to-white flex flex-col">
            {/* Header */}
            <header className="py-6 px-4">
                <div className="max-w-md mx-auto text-center">
                    <a href="/" className="font-heading text-2xl font-bold text-brand-900 hover:text-gold transition-colors">
                        House of Kendles
                    </a>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-2xl shadow-xl border border-brand/10 p-8 space-y-8">
                        {/* Welcome Text */}
                        <div className="text-center space-y-2">
                            <h1 className="font-heading text-3xl font-bold text-brand-900">
                                Welcome Back
                            </h1>
                            <p className="text-muted-foreground">
                                Sign in to access your orders and saved addresses
                            </p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                {decodeURIComponent(error)}
                            </div>
                        )}

                        {/* Sign In Content (Client Component) */}
                        <SignInContent redirectTo={redirectTo} />

                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-muted-foreground">
                                    Secure sign-in with Google
                                </span>
                            </div>
                        </div>

                        {/* Benefits */}
                        <div className="space-y-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-3">
                                <svg className="h-5 w-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Track your orders in real-time</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <svg className="h-5 w-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Save multiple delivery addresses</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <svg className="h-5 w-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Faster checkout experience</span>
                            </div>
                        </div>
                    </div>

                    {/* Continue as Guest */}
                    <p className="text-center text-sm text-muted-foreground mt-6">
                        Just browsing?{' '}
                        <a href="/" className="text-brand-900 hover:text-gold font-medium transition-colors">
                            Continue as guest
                        </a>
                    </p>
                </div>
            </main>
        </div>
    )
}
