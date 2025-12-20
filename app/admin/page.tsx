import { getDashboardStats } from "@/app/_actions/dashboardActions"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import Link from "next/link"
import {
  ShoppingCart,
  Package,
  Warehouse,
  AlertTriangle,
} from "lucide-react"

export default async function AdminDashboardPage() {
  const { pendingOrdersCount, lowStockCount, vendorCount } =
    await getDashboardStats()

  return (
    <main className="flex-grow p-4 md:p-10">
      <h1 className="font-heading text-3xl">Dashboard</h1>

      {/* Stat Cards */}
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrdersCount}</div>
            <p className="text-xs text-muted-foreground">
              Orders needing processing
            </p>
          </CardContent>
        </Card>

        <Card className={lowStockCount > 0 ? "border-destructive" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle
              className={`h-4 w-4 ${
                lowStockCount > 0 ? "text-destructive" : "text-muted-foreground"
              }`}
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockCount}</div>
            <p className="text-xs text-muted-foreground">
              Variants with stock &lt; 5
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
            <Warehouse className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vendorCount}</div>
            <p className="text-xs text-muted-foreground">
              Total suppliers tracked
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Link
          href="/admin/orders"
          className="block rounded-lg border bg-card p-6 text-card-foreground shadow-sm hover:bg-accent"
        >
          <h3 className="font-semibold flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" /> Manage Orders
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            View and update order statuses.
          </p>
        </Link>
        <Link
          href="/admin/products"
          className="block rounded-lg border bg-card p-6 text-card-foreground shadow-sm hover:bg-accent"
        >
          <h3 className="font-semibold flex items-center gap-2">
            <Package className="h-5 w-5" /> Manage Stock
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            Add or remove product inventory.
          </p>
        </Link>
        <Link
          href="/admin/vendors"
          className="block rounded-lg border bg-card p-6 text-card-foreground shadow-sm hover:bg-accent"
        >
          <h3 className="font-semibold flex items-center gap-2">
            <Warehouse className="h-5 w-5" /> Manage Vendors
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            View and add supplier details.
          </p>
        </Link>
      </div>
    </main>
  )
}