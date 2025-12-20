import Link from "next/link"
import { notFound } from "next/navigation"
import { getBomForVariant, addBomItem, deleteBomItem } from "@/app/_actions/bomActions"
import { getRawMaterials } from "@/app/_actions/rawMaterialActions"
import { getProductVariantById } from "@/app/_actions/products"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { Trash2 } from "lucide-react"
import { Combobox } from "@/components/ui/combobox"

export default async function BomEditPage({ params }: { params: { variantId: string } }) {
  const variantId = Number(params.variantId)
  if (isNaN(variantId)) notFound()

  const variant = await getProductVariantById(variantId)
  if (!variant) notFound()

  const bomItems = await getBomForVariant(variantId)
  const allRawMaterials = await getRawMaterials() // Need all materials for the dropdown

  // Prepare materials data for the Combobox
  const materialOptions = allRawMaterials.map(m => ({
    value: String(m.id),
    label: `${m.name} (${m.unit_of_measure})`,
  }))

  return (
    <main className="flex-grow p-4 md:p-10">
      <Link href={`/admin/products`} className="text-sm text-muted-foreground hover:underline mb-2 block">
        &larr; Back to Stock Management
      </Link>
      <h1 className="font-heading text-3xl">
        Edit Recipe for: {variant.productName} ({variant.size})
      </h1>
      <p className="text-muted-foreground mt-1">
        Define the raw materials needed to produce one unit of this product variant.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Current BOM List */}
        <div className="md:col-span-2">
          <h2 className="font-semibold text-xl mb-3">Current Recipe Items</h2>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Raw Material</TableHead>
                  <TableHead>Quantity Required</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead><span className="sr-only">Delete</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bomItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.raw_materials?.name}</TableCell>
                    <TableCell>{item.quantity_required}</TableCell>
                    <TableCell>{item.raw_materials?.unit_of_measure}</TableCell>
                    <TableCell className="text-right">
                      <form action={async () => {
                        "use server"
                        await deleteBomItem(item.id, variantId)
                      }}>
                        <Button size="icon" variant="ghost" type="submit">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </form>
                    </TableCell>
                  </TableRow>
                ))}
                {bomItems.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No recipe items added yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Add BOM Item Form */}
        <div>
           <form action={addBomItem} className="rounded-lg border p-6 space-y-4 sticky top-4">
             <h2 className="font-semibold text-lg">Add Recipe Item</h2>
             <input type="hidden" name="productVariantId" value={variantId} />

             <div>
                <Label htmlFor="rawMaterialId">Raw Material</Label>
                <Combobox
                    name="rawMaterialId" // Name matches the form data key
                    options={materialOptions}
                    placeholder="Select material..."
                    searchPlaceholder="Search material..."
                    notFoundText="No material found."
                    required={true}
                />
             </div>

             <div>
                <Label htmlFor="quantityRequired">Quantity Required</Label>
                <Input
                    id="quantityRequired"
                    name="quantityRequired"
                    type="number"
                    step="any" // Allow decimals like 0.15 kg
                    min="0.0001" // Prevent zero or negative
                    required
                    placeholder="e.g., 0.15 or 1"
                />
             </div>

             <Button type="submit" className="w-full bg-brand text-white hover:bg-brand-900">
                Add to Recipe
             </Button>
           </form>
        </div>
      </div>
    </main>
  )
}