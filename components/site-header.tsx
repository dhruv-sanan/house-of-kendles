"use client"

import type * as React from "react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Menu, ShoppingCart, X, User, Package, LogOut, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCart } from "@/lib/cart"
import { MainNav } from "@/components/main-nav"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useSidebar } from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { count } = useCart()
  const [bump, setBump] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const { open, setOpen } = useSidebar()
  const pathname = usePathname()

  // Auth state
  const { user, customer, loading, signOut } = useAuth()
  const [isSigningOut, setIsSigningOut] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    function onAdd() {
      // 🔒 Don't open sidebar if user is already on cart or checkout
      if (pathname === "/cart" || pathname.startsWith("/checkout")) {
        return
      }

      setBump(true)
      setOpen(true) // ✅ open the cart sidebar

      timeoutId = setTimeout(() => setBump(false), 300)
    }

    window.addEventListener("cart:add", onAdd)
    return () => {
      window.removeEventListener("cart:add", onAdd)
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [pathname, setOpen])

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await signOut()
      toast.success("Signed out successfully")
    } catch {
      toast.error("Failed to sign out")
    } finally {
      setIsSigningOut(false)
    }
  }

  // Get user display info
  const userEmail = user?.email ?? ""
  const userName = customer?.name || user?.user_metadata?.full_name || user?.user_metadata?.name || "User"
  const userAvatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture
  const userInitials = userName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-brand/10 bg-gradient-to-r from-white via-white to-brand-50/30 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Mobile Menu Trigger */}
        <div className="flex md:hidden">
          {isMounted && (
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="mr-2 hover:bg-brand/10 transition-colors duration-200"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5 text-brand-900" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-[300px] sm:w-[400px] pr-0 bg-white/95 backdrop-blur-xl border-brand/10"
              >
                <SheetHeader className="px-4 text-left flex items-center justify-between">
                  <SheetTitle className="font-heading text-2xl text-brand-900">House of Kendles</SheetTitle>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <X className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                </SheetHeader>
                <div className="h-full overflow-y-auto px-4 pb-20 pt-4">
                  {/* Mobile User Section */}
                  {user && (
                    <div className="mb-4 p-4 rounded-lg bg-brand/5 border border-brand/10">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 ring-2 ring-brand/20">
                          <AvatarImage src={userAvatar} alt={userName} />
                          <AvatarFallback className="bg-brand-100 text-brand-900 font-medium">
                            {userInitials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-brand-900 truncate">{userName}</p>
                          <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-col gap-2">
                        <MobileLink href="/orders" onClick={() => setMobileMenuOpen(false)}>
                          <Package className="h-4 w-4 mr-2" />
                          My Orders
                        </MobileLink>
                        <MobileLink href="/profile" onClick={() => setMobileMenuOpen(false)}>
                          <User className="h-4 w-4 mr-2" />
                          Profile
                        </MobileLink>
                        <button
                          onClick={() => {
                            setMobileMenuOpen(false)
                            handleSignOut()
                          }}
                          className="flex items-center text-red-600 rounded-md p-2 text-sm hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}

                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="candles">
                      <AccordionTrigger className="font-medium text-brand-900 hover:text-gold">
                        Candles
                      </AccordionTrigger>
                      <AccordionContent className="flex flex-col space-y-2 pl-4 text-muted-foreground">
                        <MobileLink href="/candles" onClick={() => setMobileMenuOpen(false)}>
                          Shop All Candles
                        </MobileLink>
                        <MobileLink href="/candles#bestsellers" onClick={() => setMobileMenuOpen(false)}>
                          Bestsellers
                        </MobileLink>
                        <MobileLink href="/candles#coffee-bar" onClick={() => setMobileMenuOpen(false)}>
                          The Coffee Bar
                        </MobileLink>
                        <MobileLink href="/candles#spiritual" onClick={() => setMobileMenuOpen(false)}>
                          Spiritual & Wellness
                        </MobileLink>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="decor">
                      <AccordionTrigger className="font-medium text-brand-900 hover:text-gold">
                        Home Decor
                      </AccordionTrigger>
                      <AccordionContent className="flex flex-col space-y-2 pl-4 text-muted-foreground">
                        <MobileLink href="/home-decor" onClick={() => setMobileMenuOpen(false)}>
                          Shop All Decor
                        </MobileLink>
                        <MobileLink href="/home-decor#urli" onClick={() => setMobileMenuOpen(false)}>
                          Urlis
                        </MobileLink>
                        <MobileLink href="/home-decor#candle-holders" onClick={() => setMobileMenuOpen(false)}>
                          Candle Holders
                        </MobileLink>
                        <MobileLink href="/home-decor#trays" onClick={() => setMobileMenuOpen(false)}>
                          Trays
                        </MobileLink>
                      </AccordionContent>
                    </AccordionItem>
                    <div className="flex flex-col space-y-4 py-4 font-medium">
                      <MobileLink href="/bath-salt" onClick={() => setMobileMenuOpen(false)}>
                        Bath Salt
                      </MobileLink>
                      <MobileLink href="/gifting" onClick={() => setMobileMenuOpen(false)}>
                        Gifting
                      </MobileLink>
                      <MobileLink href="/our-story" onClick={() => setMobileMenuOpen(false)}>
                        Our Story
                      </MobileLink>
                      <MobileLink
                        href="/quiz"
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-gold font-semibold"
                      >
                        Find Your Scent
                      </MobileLink>
                    </div>
                  </Accordion>

                  {/* Mobile Sign In Button */}
                  {!user && !loading && (
                    <div className="mt-4 pt-4 border-t">
                      <Link
                        href="/sign-in"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-center w-full py-3 px-4 bg-brand-900 text-white rounded-lg font-medium hover:bg-brand transition-colors"
                      >
                        Sign In
                      </Link>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>

        {/* Brand Logo */}
        <div className="flex flex-1 items-center justify-center md:justify-start">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-heading text-2xl font-bold tracking-wide text-brand-900 md:text-3xl group-hover:text-gold transition-colors duration-200">
              House of Kendles
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:flex-1 md:justify-center">
          <MainNav />
        </div>

        {/* Right Side Actions */}
        <div className="flex flex-1 items-center justify-end gap-2">
          {/* Cart Button */}
          <Button
            size="sm"
            variant="ghost"
            className={cn("relative hover:bg-brand/10 transition-all duration-300", bump && "scale-110")}
            aria-label="Open Cart"
            onClick={() => setOpen(!open)}
          >
            <ShoppingCart className="h-5 w-5 text-brand-900" />
            <span className="sr-only">Cart</span>
            {count > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-gold to-brand-900 text-[11px] font-bold text-white shadow-md animate-pulse">
                {count}
              </span>
            )}
          </Button>

          {/* Auth Section - Desktop */}
          <div className="hidden md:flex items-center ml-2">
            {loading ? (
              <div className="h-8 w-8 flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin text-brand-900/50" />
              </div>
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-full ring-offset-background transition-all hover:ring-2 hover:ring-brand/20 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    aria-label="Open user menu"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={userAvatar} alt={userName} />
                      <AvatarFallback className="bg-brand-100 text-brand-900 text-xs font-medium">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{userName}</p>
                      <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/orders" className="flex items-center cursor-pointer">
                      <Package className="mr-2 h-4 w-4" />
                      My Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                  >
                    {isSigningOut ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <LogOut className="mr-2 h-4 w-4" />
                    )}
                    {isSigningOut ? "Signing out..." : "Sign Out"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/sign-in">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-brand/20 hover:bg-brand/5 hover:border-brand/40 transition-colors"
                >
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

function MobileLink({
  href,
  onClick,
  className,
  children,
}: {
  href: string
  onClick?: () => void
  className?: string
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center select-none rounded-md p-2 text-sm leading-none no-underline outline-none transition-all hover:bg-brand/5 hover:text-gold hover:pl-3",
        className,
      )}
    >
      {children}
    </Link>
  )
}
