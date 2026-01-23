"use client";

import { useState } from "react";
import { CardNumberElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type StripePayButtonProps = {
  clientSecret: string;
  cardholderName: string;
  disabled?: boolean;
  onSuccess?: () => void;
};

export default function StripePayButton({ clientSecret, cardholderName, disabled, onSuccess }: StripePayButtonProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/5b48d651-031a-4992-b459-29ae3cf4b327',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'StripePayButton.tsx:handleConfirm:enter',message:'Stripe confirm clicked',data:{hasStripe:!!stripe,hasElements:!!elements,hasClientSecret:!!clientSecret},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H1'})}).catch(()=>{});
    // #endregion agent log
    if (!stripe || !elements) {
      toast.error("Stripe is not ready yet.");
      return;
    }

    const cardElement = elements.getElement(CardNumberElement);
    if (!cardElement) {
      toast.error("Please enter card details first.");
      return;
    }
    setSubmitting(true);
    try {
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: { name: cardholderName || "Cardholder" },
        },
      });

      if (result.error) {
        toast.error(result.error.message || "Payment failed.");
        return;
      }

      if (result.paymentIntent?.status === "succeeded") {
        toast.success("Payment success! Please wait for confirmation.");
        onSuccess?.();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Button
      onClick={handleConfirm}
      disabled={submitting || disabled}
      className="w-full bg-purple-600 hover:bg-purple-700 h-11 sm:h-12 text-sm sm:text-lg"
    >
      {submitting ? "Processing..." : "Pay with Stripe"}
    </Button>
  );
}
