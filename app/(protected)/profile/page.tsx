import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { getCurrentUserWithCustomer } from '@/lib/auth'
import { AddressList } from '@/components/address-list'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/footer'
import { ProfileClient } from '@/components/profile-client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Loader2, Mail, User } from 'lucide-react'
import { FadeIn } from '@/components/ui/motion-wrappers'

export const metadata = {
    title: 'Profile | House of Kendles',
    description: 'Manage your profile and delivery addresses',
}

/**
 * Profile page - displays user info and address management
 * Protected route - requires authentication
 */
export default async function ProfilePage() {
    const { user, customer } = await getCurrentUserWithCustomer()

    // Redirect to sign-in if not authenticated
    if (!user) {
        redirect('/sign-in?redirect=/profile')
    }

    // Get user display info
    const userName =
        customer?.name ||
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        'User'
    const userEmail = customer?.email || user.email || ''
    const userAvatar =
        user.user_metadata?.avatar_url || user.user_metadata?.picture
    const userInitials = userName
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)

    return (
        <>
            <SiteHeader />
            <main className="min-h-screen bg-surface">
                <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
                    {/* Profile Header */}
                    <FadeIn className="mb-12">
                        <div className="flex flex-col sm:flex-row items-center gap-8 p-8 rounded-2xl bg-white border border-brand/10 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                <User className="w-32 h-32 text-brand-900" />
                            </div>

                            {/* Avatar */}
                            <Avatar className="h-24 w-24 ring-4 ring-brand/10 shadow-md">
                                <AvatarImage src={userAvatar} alt={userName} />
                                <AvatarFallback className="bg-brand-900 text-gold text-2xl font-heading">
                                    {userInitials}
                                </AvatarFallback>
                            </Avatar>

                            {/* User Info */}
                            <div className="flex-1 text-center sm:text-left relative z-10">
                                <h1 className="text-3xl font-bold text-brand-900 font-heading">{userName}</h1>
                                <div className="mt-3 flex flex-col sm:flex-row items-center gap-6 text-sm text-brand-900/60 font-medium">
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-brand-900/40" />
                                        {userEmail}
                                    </div>
                                    {customer?.phone && (
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-brand-900/40" />
                                            {customer.phone}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </FadeIn>

                    {/* Addresses Section */}
                    <section className="mb-10">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-brand-900 font-heading">
                                My Addresses
                            </h2>
                            <ProfileClient />
                        </div>

                        <Suspense
                            fallback={
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="h-8 w-8 animate-spin text-brand-900" />
                                </div>
                            }
                        >
                            <AddressList />
                        </Suspense>
                    </section>
                </div>
            </main>
            <SiteFooter />
        </>
    )
}
