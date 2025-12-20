import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { getOrders, type OrderWithItems } from "@/app/_actions/orderActions"
import { OrderStatusChanger } from "./OrderStatusChanger"
import { CheckAvailabilityButton } from "./CheckAvailabilityButton"
import { OrderDetailsModal } from "./OrderDetailsModal" // <-- IMPORT NEW COMPONENT
//TODO add check availability button for all pending orders and create action of reducing stock when state changes fro pending to processing
export default async function AdminOrdersPage() {
  const orders = await getOrders()

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-grow p-4 md:p-10">
        <h1 className="font-heading text-3xl">Manage Orders</h1>

        <div className="mt-6 overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Stock Check</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No orders found.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order: OrderWithItems) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.order_uid}</TableCell>
                    <TableCell>{order.customer_name}</TableCell>
                    <TableCell>{new Date(order.order_date).toLocaleDateString()}</TableCell>
                    <TableCell>₹{order.total_amount}</TableCell>
                    <TableCell>
                      {/* --- UPDATED: Use the modal component --- */}
                      <OrderDetailsModal items={order.order_items} />
                    </TableCell>
                    <TableCell>
                      <OrderStatusChanger orderId={order.id} currentStatus={order.status} />
                    </TableCell>
                    <TableCell>
                      <CheckAvailabilityButton orderId={order.id} orderUid={order.order_uid} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  )
}