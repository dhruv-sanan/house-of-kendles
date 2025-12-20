"use client"

import { useTransition, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { addPurchaseLog } from "@/app/_actions/rawMaterialActions"
import { useToast } from "@/hooks/use-toast"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

type Vendor = { id: number; name: string }
export type RawMaterial = { id: number; name: string; unit_of_measure: string }

export function AddPurchaseForm({ vendors, materials }: { vendors: Vendor[], materials: RawMaterial[] }) {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)
  const [selectedMaterial, setSelectedMaterial] = useState<RawMaterial | null>(null)
  const [comboboxOpen, setComboboxOpen] = useState(false)

  const handleAction = (formData: FormData) => {
    // Manually add the selected material ID if it exists
    if (selectedMaterial) {
      formData.set('rawMaterialId', String(selectedMaterial.id))
    } else {
        toast({ title: "Error", description: "Please select a raw material.", variant: "destructive"})
        return; // Prevent submission if no material is selected
    }


    startTransition(async () => {
      const result = await addPurchaseLog(formData)
      if (result.success) {
        toast({ title: "Success!", description: "Purchase logged and stock updated." })
        formRef.current?.reset()
        setSelectedMaterial(null) // Reset combobox selection
      } else {
        toast({ title: "Error", description: result.error || "Failed to log purchase.", variant: "destructive" })
      }
    })
  }

  return (
    <form ref={formRef} action={handleAction} className="rounded-lg border p-6 space-y-4">
      <h2 className="font-semibold text-lg">Log New Purchase</h2>

      {/* Vendor Select (remains the same) */}
      <div>
        <Label htmlFor="vendorId">Vendor (Optional)</Label>
        <Select name="vendorId" disabled={isPending}>
          <SelectTrigger>
            <SelectValue placeholder="Select vendor" />
          </SelectTrigger>
          <SelectContent>
          <SelectItem value="none">-- No Vendor --</SelectItem>
            {vendors.map((v) => (
              <SelectItem key={v.id} value={String(v.id)}>
                {v.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

       {/* --- NEW: Raw Material Combobox --- */}
       <div>
         <Label htmlFor="rawMaterialId">Raw Material</Label>
         <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={comboboxOpen}
                    className="w-full justify-between font-normal"
                    disabled={isPending}
                >
                    {selectedMaterial
                        ? `${selectedMaterial.name} (${selectedMaterial.unit_of_measure})`
                        : "Select material..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                    <CommandInput placeholder="Search material..." />
                    <CommandList>
                        <CommandEmpty>No material found.</CommandEmpty>
                        <CommandGroup>
                            {materials.map((material) => (
                                <CommandItem
                                    key={material.id}
                                    value={`${material.name} ${material.unit_of_measure}`} // Use a unique value for searching
                                    onSelect={() => {
                                        setSelectedMaterial(material)
                                        setComboboxOpen(false)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            selectedMaterial?.id === material.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {material.name} ({material.unit_of_measure})
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
         </Popover>
         {/* Hidden input to store the actual ID for the form submission */}
         {selectedMaterial && <input type="hidden" name="rawMaterialId" value={selectedMaterial.id} />}
       </div>


      {/* Quantity Input (Now shows unit dynamically) */}
      <div>
        <Label htmlFor="quantityPurchased">
            Quantity Received {selectedMaterial && `(in ${selectedMaterial.unit_of_measure})`}
        </Label>
        <Input
            id="quantityPurchased"
            name="quantityPurchased"
            type="number"
            step="any"
            required
            disabled={isPending}
            placeholder={selectedMaterial ? `e.g., 10 ${selectedMaterial.unit_of_measure}` : "Select material first"}
         />
      </div>

       {/* Total Cost (remains the same) */}
       <div>
        <Label htmlFor="totalCost">Total Cost (Optional)</Label>
        <Input id="totalCost" name="totalCost" type="number" step="0.01" placeholder="e.g., 1500.50" disabled={isPending}/>
      </div>

       {/* Date Received (remains the same) */}
       <div>
        <Label htmlFor="dateReceived">Date Received</Label>
        <Input id="dateReceived" name="dateReceived" type="date" defaultValue={new Date().toISOString().split('T')[0]} disabled={isPending}/>
      </div>


      {/* Notes (remains the same) */}
      <div>
        <Label htmlFor="purchase-notes">Notes (Optional)</Label>
        <Textarea id="purchase-notes" name="notes" placeholder="Batch number, quality check, etc." disabled={isPending}/>
      </div>

      {/* Submit Button (remains the same) */}
      <Button type="submit" className="w-full bg-brand text-white hover:bg-brand-900" disabled={isPending || !selectedMaterial}>
        {isPending ? "Logging..." : "Log Purchase & Add Stock"}
      </Button>
    </form>
  )
}

