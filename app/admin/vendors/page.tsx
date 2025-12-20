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
import { Textarea } from "@/components/ui/textarea"
import { getVendors, addVendor, deleteVendor } from "@/app/_actions/vendorActions"

export default async function VendorsPage() {
  const vendors = await getVendors()

  return (
    <>
      <main className="flex-grow p-4 md:p-10">
        <h1 className="font-heading text-3xl">Manage Vendors</h1>
        <p className="text-muted-foreground mt-1">
          Keep track of your suppliers and purchase details.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead><span className="sr-only">Actions</span></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendors.map((vendor) => (
                    <TableRow key={vendor.id}>
                      <TableCell className="font-medium">{vendor.name}</TableCell>
                      <TableCell>{vendor.category}</TableCell>
                      <TableCell>{vendor.location}</TableCell>
                      <TableCell>{vendor.phone}</TableCell>
                      <TableCell className="text-right">
                         <form action={async () => {
                           "use server";
                           await deleteVendor(vendor.id)
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
          
          <div>
            <form action={addVendor} className="rounded-lg border p-6 space-y-4">
              <h2 className="font-semibold text-lg">Add New Vendor</h2>
              <div>
                  <Label htmlFor="name">Vendor Name</Label>
                  <Input id="name" name="name" required />
              </div>
               <div>
                  <Label htmlFor="category">Category</Label>
                  <Input id="category" name="category" placeholder="e.g., Wax, Jars, Packaging" />
              </div>
               <div>
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" name="location" />
              </div>
               <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" name="phone" />
              </div>
               <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" name="notes" placeholder="Purchase history, item costs, etc."/>
              </div>
              <Button type="submit" className="w-full bg-brand text-white hover:bg-brand-900">Add Vendor</Button>
            </form>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}

