"use client"

import { useTransition, useRef } from "react"
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
import { addRawMaterial } from "@/app/_actions/rawMaterialActions"
import { useToast } from "@/hooks/use-toast"

const CATEGORIES = ["candles", "bath-salt", "home-decor"]

export function AddMaterialForm() {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  const handleAction = (formData: FormData) => {
    startTransition(async () => {
      const result = await addRawMaterial(formData)
      if (result.success) {
        toast({ title: "Success!", description: "New raw material defined." })
        formRef.current?.reset()
      } else {
        toast({ title: "Error", description: result.error || "Failed to add material.", variant: "destructive" })
      }
    })
  }

  return (
    <form ref={formRef} action={handleAction} className="rounded-lg border p-6 space-y-4">
      <h2 className="font-semibold text-lg">Define New Material</h2>
      <div>
        <Label htmlFor="material-name">Material Name</Label>
        <Input id="material-name" name="name" required placeholder="e.g., Soy Wax" disabled={isPending} />
      </div>
      <div>
        <Label htmlFor="unit">Unit of Measure</Label>
        <Input id="unit" name="unit_of_measure" required placeholder="e.g., kg, units, meters" disabled={isPending} />
      </div>
      <div>
        <Label htmlFor="category">Category</Label>
        <Select name="category" disabled={isPending}>
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {/* <-- FIX: Changed value from "" to "__other__" --> */}
            <SelectItem value="__other__">-- Other / Uncategorized --</SelectItem>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat} className="capitalize">{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="material-notes">Notes</Label>
        <Textarea id="material-notes" name="notes" placeholder="Optional notes" disabled={isPending} />
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Adding..." : "Add Material"}
      </Button>
    </form>
  )
}