import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/footer"
import { Package, ShoppingCart, Warehouse, Boxes } from "lucide-react" // Added Boxes icon
import { Toaster } from "@/components/ui/toaster"
import { AdminNav } from "./AdminNav"
import { getCurrentUser } from "@/lib/auth"
import { isAdmin } from "@/lib/admin-auth"
import { redirect } from "next/navigation"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/sign-in?redirect=/admin')
  }

  if (!isAdmin(user.id)) {
    redirect('/')
  }

  return (
    <>
      <SiteHeader />
      <div className="grid min-h-[calc(100vh-theme(spacing.16))] w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <div className="hidden border-r bg-muted/40 md:block">
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
              <Link
                href="/admin"
                className="flex items-center gap-2 font-semibold"
              >
                <Package className="h-6 w-6" />
                <span>Admin Panel</span>
              </Link>
            </div>
            <div className="flex-1">
              <AdminNav />
            </div>
          </div>
        </div>
        <div className="flex flex-col">
          {children}
          <SiteFooter />
          <Toaster />
        </div>
      </div>
    </>
  )
}

