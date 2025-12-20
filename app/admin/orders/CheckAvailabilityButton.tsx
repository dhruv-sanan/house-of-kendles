"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog"
import { checkOrderAvailability, type OrderAvailabilityResult } from "@/app/_actions/bomActions"
import { PackageCheck, PackageSearch, AlertTriangle } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"

export function CheckAvailabilityButton({ orderId, orderUid }: { orderId: number, orderUid: string }) {
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<OrderAvailabilityResult | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const handleCheck = () => {
    setIsOpen(true)
    setResult(null) // Clear previous results
    startTransition(async () => {
      const res = await checkOrderAvailability(orderId)
      setResult(res)
    })
  }

  const allAvailable = result?.available === true
  const notAvailable = result?.available === false && result.missing.length > 0
  const checkError = result?.error

  return (
    <>
      <Button variant="outline" size="sm" onClick={handleCheck} disabled={isPending}>
        {isPending ? <Spinner className="mr-1.5 h-4 w-4" /> : <PackageSearch className="mr-1.5 h-4 w-4" />}
        Check Stock
      </Button>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isPending && "Checking Availability..."}
              {!isPending && result && `Stock Check for Order #${orderUid}`}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="pt-4">
                {isPending && (
                  <div className="flex justify-center items-center h-24">
                    <Spinner className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                
                {allAvailable && (
                  <div className="flex flex-col items-center gap-4 text-center">
                    <PackageCheck className="h-12 w-12 text-green-600" />
                    <p className="font-semibold text-lg text-foreground">All materials are in stock!</p>
                    <p>You can fulfill this order.</p>
                  </div>
                )}
                
                {notAvailable && (
                  <div className="flex flex-col gap-4">
                     <div className="flex items-center gap-3 bg-destructive/10 p-3 rounded-md">
                       <AlertTriangle className="h-8 w-8 text-destructive shrink-0" />
                       <p className="font-semibold text-destructive">Materials missing. Order cannot be fulfilled.</p>
                     </div>
                     <p className="text-sm font-medium text-foreground">Shortages:</p>
                     <ul className="list-disc pl-5 space-y-2 text-sm">
                       {result.missing.map(item => (
                         <li key={item.name} className="text-foreground">
                           <span className="font-semibold">{item.name}</span>
                           <ul className="pl-4 text-muted-foreground">
                             <li>Required: {item.required} {item.unit}</li>
                             <li>Available: {item.available} {item.unit}</li>
                             <li className="font-medium text-destructive">
                               Short by: {item.required - item.available} {item.unit}
                             </li>
                           </ul>
                         </li>
                       ))}
                     </ul>
                  </div>
                )}
                
                {checkError && (
                  <div className="flex flex-col items-center gap-4 text-center">
                    <AlertTriangle className="h-12 w-12 text-destructive" />
                    <p className="font-semibold text-lg text-destructive">An Error Occurred</p>
                    <p className="text-muted-foreground text-sm">{result.error}</p>
                  </div>
                )}

              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setIsOpen(false)}>
              Close
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
