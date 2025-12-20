// components/order-payment-client.tsx

"use client";

import { useState, useEffect } from "react";
import type { FullOrder } from "@/app/order/[id]/page"; // Adjust path if needed

export function OrderPaymentClient({ order }: { order: FullOrder }) {
  // State to hold the created PaymentRequest object
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null);
  const [canMakeGPayPayment, setCanMakeGPayPayment] = useState(false);

  // This effect runs once when the 'order' prop is available.
  // It creates the payment request and checks for GPay availability.
  useEffect(() => {
    if (window.PaymentRequest && order) {
      const supportedInstruments: PaymentMethodData[] = [
        {
          supportedMethods: 'https://tez.google.com/pay',
          data: {
            pa: 'shreya12703@OKHDFCBANK',
            pn: 'SHREYA KACKER',
            tr: `${order.order_uid}-${Date.now()}`,
            mc: '5411',
            tn: `Payment for Order #${order.order_uid}`,
            am: order.total_amount.toString(),
            cu: 'INR',
          },
        }
      ];

      const details: PaymentDetailsInit = {
        total: {
          label: 'Total',
          amount: {
            currency: 'INR',
            value: order.total_amount.toString(),
          },
        },
      };

      try {
        const request = new PaymentRequest(supportedInstruments, details);
        setPaymentRequest(request); // Store the created request in state

        // Check if the user can make a payment
        request.canMakePayment().then(result => {
          setCanMakeGPayPayment(result);
        });
      } catch (error) {
        console.error("Error creating PaymentRequest:", error);
      }
    }
  }, [order]); // This effect depends only on the order prop

  const handleGPayPayment = async () => {
    // If the paymentRequest object isn't ready, do nothing.
    if (!paymentRequest) {
      alert("Payment request is not ready. Please wait a moment and try again.");
      return;
    }

    try {
      // Use the paymentRequest object directly from state
      const paymentResponse = await paymentRequest.show();
      console.log('Payment successful:', paymentResponse);
      alert('Payment successful!');
      paymentResponse.complete('success');
    } catch (error) {
      console.error("Payment failed or was cancelled:", error);
      alert('Payment failed or was cancelled.');
    }
  };
  
  // The JSX is simplified as we don't need the extra text blocks
  return (
    <div className="rounded-lg border p-6">
      <p className="text-sm">Amount Payable</p>
      <p className="text-l font-bold">₹{order.total_amount}</p>

      <div className="mt-8">
        {canMakeGPayPayment ? (
          <button
            onClick={handleGPayPayment}
            className="inline-flex w-full items-center justify-center rounded-md bg-black px-4 py-3 text-center font-bold text-white transition hover:bg-gray-800"
          >
            <img src="https://www.gstatic.com/images/icons/material/system/2x/google_pay_mark_white_24dp.png" alt="Google Pay" className="mr-2 h-6 w-6"/>
            Pay with Google Pay
          </button>
        ) : (
          <p className="text-sm text-gray-600">
            Google Pay is not available. Please ensure you are on a supported browser (like Chrome for Android) and are logged in.
          </p>
        )}
      </div>
    </div>
  );
}