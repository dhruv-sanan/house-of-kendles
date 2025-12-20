"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Warehouse,
  Boxes, // Added Boxes icon
} from "lucide-react"
import { cn } from "@/lib/utils"
import { TicketPercent } from "lucide-react"

export function AdminNav() {
  const pathname = usePathname()

  const navItems = [
    {
      href: "/admin",
      label: "Dashboard",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      href: "/admin/orders",
      label: "Orders",
      icon: ShoppingCart,
    },
    {
      href: "/admin/products", // This is the Finished Goods Stock page
      label: "Finished Stock",
      icon: Package,
    },
    {
      href: "/admin/materials", // New Raw Materials page
      label: "Raw Materials",
      icon: Boxes,
    },
    {
      href: "/admin/vendors",
      label: "Vendors",
      icon: Warehouse,
    },
    {
      href: "/admin/coupons", // <-- ADD THIS
      label: "Coupons",
      icon: TicketPercent,
    },
  ]

  return (
    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
      {navItems.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href)
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
              isActive
                ? "bg-muted text-primary"
                : "text-muted-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
