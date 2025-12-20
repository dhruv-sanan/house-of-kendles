import { SiteFooter } from "@/components/footer"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getAvailableCoupons } from "@/app/_actions/cartActions" // Reuse this action
import { addCoupon, deleteCoupon } from "@/app/_actions/adminCouponActions.ts" // New file for these actions

export default async function CouponsPage() {
  const coupons = await getAvailableCoupons()

  return (
    <>
      <main className="flex-grow p-4 md:p-10">
        <h1 className="font-heading text-3xl">Manage Coupons</h1>
        <p className="text-muted-foreground mt-1">
          Create discount codes for your customers.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Coupon List */}
          <div className="lg:col-span-2">
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Min Order</TableHead>
                    <TableHead><span className="sr-only">Delete</span></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coupons.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-bold">{c.code}</TableCell>
                      <TableCell className="capitalize">{c.discount_type}</TableCell>
                      <TableCell>{c.discount_value}</TableCell>
                      <TableCell>₹{c.min_order_value}</TableCell>
                      <TableCell className="text-right">
                        <form action={async () => {
                          "use server"
                          await deleteCoupon(c.id)
                        }}>
                          <Button variant="destructive" size="sm" type="submit">Delete</Button>
                        </form>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Add Coupon Form */}
          <div>
            <form action={addCoupon} className="rounded-lg border p-6 space-y-4 sticky top-4">
              <h2 className="font-semibold text-lg">Create Coupon</h2>
              
              <div>
                <Label htmlFor="code">Code</Label>
                <Input id="code" name="code" placeholder="e.g., SUMMER20" className="uppercase" required />
              </div>

              <div>
                <Label htmlFor="type">Discount Type</Label>
                <Select name="discount_type" defaultValue="percentage">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="value">Discount Value</Label>
                <Input id="value" name="discount_value" type="number" min="1" required />
              </div>

              <div>
                <Label htmlFor="min_order">Min Order Value (₹)</Label>
                <Input id="min_order" name="min_order_value" type="number" min="0" defaultValue="0" />
              </div>

              <Button type="submit" className="w-full bg-brand text-white hover:bg-brand-900">
                Add Coupon
              </Button>
            </form>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}