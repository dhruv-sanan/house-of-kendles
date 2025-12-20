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
import { Toaster } from "@/components/ui/toaster"

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
        <Suspense fallback={null}>
          <HashScroll />
          <SidebarProvider defaultOpen={false}>
            <div className="flex min-h-screen flex-col w-full">
               {children}
            </div>
            {/* The Cart Sidebar sits on the right */}
            <CartSidebar />
          </SidebarProvider>
          <Toaster />
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}