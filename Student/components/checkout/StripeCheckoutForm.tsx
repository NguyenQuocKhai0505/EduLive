"use client";

import {
  CardCvcElement,
  CardExpiryElement,
  CardNumberElement,
} from "@stripe/react-stripe-js";
type StripeCheckoutFormProps = {
  cardholderName: string;
  onCardholderNameChange: (value: string) => void;
};

export default function StripeCheckoutForm({
  cardholderName,
  onCardholderNameChange,
}: StripeCheckoutFormProps) {
  const elementStyle = {
    style: {
      base: {
        color: "#e2e8f0",
        fontSize: "14px",
        fontFamily: "Inter, system-ui, -apple-system, sans-serif",
        "::placeholder": { color: "#94a3b8" },
      },
      invalid: { color: "#fca5a5" },
    },
  };

  return (
    <div className="pl-6 space-y-3">
      <input
        value={cardholderName}
        onChange={(event) => onCardholderNameChange(event.target.value)}
        placeholder="Name on card"
        className="h-10 w-full rounded-md border border-slate-200 dark:border-slate-700 bg-transparent px-3 text-sm text-slate-900 dark:text-white"
      />
      <div className="rounded-md border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm">
        <CardNumberElement options={elementStyle} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-md border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm">
          <CardExpiryElement options={elementStyle} />
        </div>
        <div className="rounded-md border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm">
          <CardCvcElement options={elementStyle} />
        </div>
      </div>
    </div>
  );
}
