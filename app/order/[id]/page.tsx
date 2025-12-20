// app/order/[id]/page.tsx

import { supabase } from "@/lib/supabase/client";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/footer";
import { OrderPaymentClient } from "@/components/order-payment-client";
import { cookies } from "next/headers";

export type FullOrder = Awaited<ReturnType<typeof getOrder>>;
type OrderDetails = NonNullable<FullOrder>;
type OrderItem = OrderDetails['order_items'][number];

async function getOrder(id: string) {
  const { data: order, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      customers (*),
      order_items (
        *,
        product_variants (
          size,
          image_url, 
          products (name) 
        )
      )
    `
    )
    .eq("order_uid", id)
    .single();

  if (error) {
    console.error("Supabase error fetching order:", error);
    return null;
  }
  return order;
}

// ✅ FIXED: params is now typed as a Promise and awaited
export default async function OrderDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params; // Await the params object
  const { id } = params; 
  
  const order = await getOrder(id);

  if (!order) {
    notFound();
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-xl px-4 py-10">
        <h1 className="font-heading text-3xl">Thank You for Your Order!</h1>
        <div className="mt-6 rounded-lg border p-6">
            <p className="text-sm">Your Order ID</p>
            <p className="font-heading text-2xl text-brand-900">{order.order_uid}</p>
            <div className="mt-4 border-t pt-4">
              <p className="font-semibold">Customer:</p>
              <p>{order.customers?.name}</p>
              <p>{order.customers?.address}</p>
            </div>
            <div className="mt-4 border-t pt-4">
                <p className="font-semibold">Items:</p>
                <ul className="mt-2 space-y-4">
                    {order.order_items.map((item: OrderItem) => (
                        <li key={item.id} className="flex items-center gap-4">
                            <img 
                              src={item.product_variants?.image_url ?? '/placeholder.png'} 
                              alt={item.product_variants?.products?.name ?? 'Product Image'} 
                              className="h-16 w-16 rounded-md object-cover" 
                            />
                            <div>
                                <p className="font-medium">{item.product_variants?.products?.name}</p>
                                <p className="text-sm text-muted-foreground">
                                    Size: {item.product_variants?.size}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {item.quantity} x ₹{item.price_at_purchase}
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="mt-4 flex items-center justify-between border-t pt-4">
              <p className="font-semibold">Total Amount</p>
              <p className="text-xl font-bold">₹{order.total_amount}</p>
            </div>
        </div>
        
        <div className="mt-8">
          <OrderPaymentClient order={order} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}