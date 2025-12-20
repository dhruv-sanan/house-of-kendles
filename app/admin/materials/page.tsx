import { Suspense } from "react"
import { SiteFooter } from "@/components/footer"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { getRawMaterials, getPurchaseHistory } from "@/app/_actions/rawMaterialActions"
import { getVendors } from "@/app/_actions/vendorActions"
import { AddPurchaseForm } from "./AddPurchaseForm"
import { AddMaterialForm } from "./AddMaterialForm" // <-- Import the new form
import { CategoryTabs } from "./CategoryTabs"

// This is the component that fetches and displays data.
// It's wrapped in Suspense on the main page.
async function MaterialData({ category }: { category: string }) {
  // Fetch data based on the category
  const materials = await getRawMaterials(category)
  const vendors = await getVendors()
  const history = await getPurchaseHistory(category)

  // We still need all materials for the "Add Purchase" dropdown,
  // regardless of the selected tab.
  const allMaterials = await getRawMaterials()

  return (
    <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
      {/* Column 1 & 2: Lists */}
      <div className="lg:col-span-2 space-y-8">
        {/* Current Stock List */}
        <div>
          <h2 className="font-semibold text-xl mb-3">Current Stock</h2>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Material Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Unit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materials.map((material) => (
                  <TableRow key={material.id}>
                    <TableCell className="font-medium">{material.name}</TableCell>
                    <TableCell className="capitalize text-muted-foreground">{material.category || 'Other'}</TableCell>
                    <TableCell>{material.current_stock}</TableCell>
                    <TableCell>{material.unit_of_measure}</TableCell>
                  </TableRow>
                ))}
                {materials.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No materials found in this category.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Purchase History List */}
        <div>
          <h2 className="font-semibold text-xl mb-3">Recent Purchases</h2>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{new Date(item.date_received).toLocaleDateString()}</TableCell>
                    <TableCell>{item.raw_materials?.name}</TableCell>
                    <TableCell>{item.quantity_purchased} {item.raw_materials?.unit_of_measure}</TableCell>
                    <TableCell>{item.vendors?.name ?? 'N/A'}</TableCell>
                    <TableCell>{item.total_cost ? `₹${item.total_cost}` : '-'}</TableCell>
                  </TableRow>
                ))}
                {history.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No purchase history found in this category.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Column 3: Forms */}
      <div className="space-y-6">
        {/* Log Purchase Form */}
        <AddPurchaseForm vendors={vendors} materials={allMaterials} />

        {/* Define New Material Form */}
        <AddMaterialForm /> {/* <-- Use the new client component here */}
      </div>
    </div>
  )
}

// Default export: The main page component
export default function MaterialsPage({
  searchParams,
}: {
  searchParams: { category?: string }
}) {
  // This is the correct way to access searchParams in a Server Component
  const category = searchParams.category || "all"

  return (
    <>
      <main className="flex-grow p-4 md:p-10">
        <h1 className="font-heading text-3xl">Manage Raw Materials</h1>
        <p className="text-muted-foreground mt-1">
          Track inventory levels and log purchases from vendors.
        </p>
        
        {/* Suspense is used to stream the UI. */}
        <Suspense fallback={<div>Loading tabs...</div>}>
          <CategoryTabs />
        </Suspense>

        <Suspense fallback={<div className="mt-6">Loading materials...</div>}>
          {/* Pass the category to the data-fetching component */}
          <MaterialData category={category} />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  )
}