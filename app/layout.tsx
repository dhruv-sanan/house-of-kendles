import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Cormorant_Garamond } from "next/font/google"
import { Suspense } from "react"
import { HashScroll } from "@/components/hash-scroll"
import { SidebarProvider } from "@/components/ui/sidebar"
import { CartSidebar } from "@/components/cart-sidebar"
import { Toaster as ShadcnToaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "sonner"
import { AuthProvider } from "@/providers/auth-provider"
import { SessionProvider } from "@/hooks/use-session"

export const metadata: Metadata = {
  title: "House of Kendles",
  description: "Handcrafted aromas for the modern home.",
  generator: "v0.app",
}

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} ${cormorant.variable} antialiased`}>
      <body className="font-sans bg-background text-foreground">
        <AuthProvider>
          <SessionProvider>
            <Suspense fallback={null}>
              <HashScroll />
              <SidebarProvider defaultOpen={false}>
                <div className="flex min-h-screen flex-col w-full">
                  {children}
                </div>
                {/* The Cart Sidebar sits on the right */}
                <CartSidebar />
              </SidebarProvider>
              <ShadcnToaster />
              <SonnerToaster
                position="bottom-right"
                toastOptions={{
                  style: {
                    background: 'white',
                    border: '1px solid #e5e7eb',
                  },
                }}
              />
            </Suspense>
          </SessionProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}