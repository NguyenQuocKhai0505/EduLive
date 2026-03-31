"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { normalizeMediaUrl } from "@/lib/media-url";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getCartItems, CartItemResponse, checkout, getOrderStatus } from "@/services/cart.service";
import { capturePaypalOrder, createPaypalOrder, createStripeIntent } from "@/services/payment.service";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { toast } from "sonner";
import StripeCheckoutForm from "@/components/checkout/StripeCheckoutForm";
import StripePayButton from "@/components/checkout/StripePayButton";

type PaymentMethod = "stripe" | "paypal" | "momo";
type CountryOption = "VN" | "US";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [items, setItems] = useState<CartItemResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [method, setMethod] = useState<PaymentMethod>("stripe");
  const [country, setCountry] = useState<CountryOption>("VN");
  const [orderId, setOrderId] = useState<number | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [cardholderName, setCardholderName] = useState("");
  const [checkingStatus, setCheckingStatus] = useState(false);
  

  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);
        setError(null);
        const cartItems = await getCartItems();
        setItems(cartItems);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load cart");
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  const selectedCourseIds = useMemo(() => {
    const raw = searchParams.get("selected");
    if (!raw) return [];
    return raw
      .split(",")
      .map((id) => Number(id))
      .filter((id) => Number.isFinite(id));
  }, [searchParams]);

  const selectedItems = useMemo(() => {
    if (selectedCourseIds.length === 0) return items;
    const selectedSet = new Set(selectedCourseIds);
    return items.filter((item) => selectedSet.has(item.courseId));
  }, [items, selectedCourseIds]);

  const subtotal = useMemo(
    () => selectedItems.reduce((sum, item) => sum + Number(item.priceSnapshot), 0),
    [selectedItems]
  );
  const currency = country === "VN" ? "VND" : "USD";
  const VND_PER_USD = 25000;
  const paypalAmountUsd = Number((subtotal / VND_PER_USD).toFixed(2));
  const displayTotal = currency === "USD" ? subtotal / VND_PER_USD : subtotal;
  const formatMoney = (amount: number) => {
    if (currency === "USD") {
      return `$${amount.toFixed(2)}`;
    }
    return `${Math.round(amount).toLocaleString("vi-VN")}đ`;
  };

  //STRIPE
  const handleStripeStart = async () => {
    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      toast.error("Missing Stripe publishable key.");
      return;
    }
    if (selectedItems.length === 0) {
      toast.error("Please select at least one course to checkout.");
      return;
    }
    if (subtotal < 12000) {
      toast.error("Amount too small. Minimum Stripe charge is 12,000 VND.");
      return;
    }
    setPaying(true);
    try {
      const idempotencyKey = crypto.randomUUID();
      const order = await checkout(idempotencyKey, selectedCourseIds.length ? selectedCourseIds : undefined); // từ cart.service.ts
      setOrderId(order.id);
      const intent = await createStripeIntent(order.id, subtotal);
      setClientSecret(intent.clientSecret);
    } finally {
      setPaying(false);
    }
  };

  const startOrderStatusPolling = (id: number) => {
    if (checkingStatus) return;
    setCheckingStatus(true);
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts += 1;
      try {
        const result = await getOrderStatus(id);
        if (result.status === "PAID") {
          clearInterval(interval);
          setCheckingStatus(false);
          toast.success("Order confirmed! Redirecting...");
          router.push("/");
          return;
        }
        if (result.status === "FAILED") {
          clearInterval(interval);
          setCheckingStatus(false);
          toast.error("Payment failed. Please try again.");
        }
      } catch {
        // ignore transient errors while polling
      }
      if (attempts >= 20) {
        clearInterval(interval);
        setCheckingStatus(false);
        toast.error("Confirmation timeout. Please refresh or check your orders.");
      }
    }, 2000);
  };
  //PAYPAL
  const handlePaypalStart = async () => {
    if(selectedItems.length ===0){
      toast.error("Please select at least one course to checkout")
      return
    }
    if(paypalAmountUsd<=0){
      toast.error("Amount too small. Minimum Paypal charge is 0.01 USD.")
      return
    }
    setPaying(true)
    const idempotencyKey = crypto.randomUUID()
    const order = await checkout(idempotencyKey,selectedCourseIds.length ? selectedCourseIds : undefined)

    const paypalOrder = await createPaypalOrder(order.id,paypalAmountUsd)
    const approvalLink = paypalOrder.links.find((link:any)=>link.rel==="approve")?.href

    if(!approvalLink){
      toast.error("Paypal approval link not found")
      setPaying(false)
      return
    }
    window.location.href = approvalLink
  }

  useEffect(()=>{
    const token = searchParams.get("token")
    const paypalFlag = searchParams.get("paypal")
    const orderIdParam = searchParams.get("orderId")

    if(!token || paypalFlag !=="1" || !orderIdParam) return 
    const paypalOrderId = token
    const numericOrderId = Number(orderIdParam)

    capturePaypalOrder(paypalOrderId, numericOrderId)
    .then(() => {
      toast.success("PayPal payment confirmed! Redirecting...");
      router.push("/");
    })
    .catch(() => toast.error("PayPal capture failed. Please try again."));
  },[searchParams,router])

  const checkoutGrid = (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
      <div className="lg:col-span-8 space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4 sm:p-6">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-3">Billing address</h2>
          <label className="block text-sm text-slate-600 dark:text-slate-400 mb-2">Country</label>
          <select
            className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
            value={country}
            onChange={(event) => setCountry(event.target.value as CountryOption)}
          >
            <option value="VN">Vietnam</option>
            <option value="US">United States</option>
          </select>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-3">
            Prices are displayed in {currency}. Taxes may apply based on your location.
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4 sm:p-6">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Payment method</h2>

          <div className="space-y-3">
            <label className="flex items-center gap-3 text-sm">
              <input
                type="radio"
                checked={method === "stripe"}
                onChange={() => setMethod("stripe")}
              />
              <span className="font-medium">Stripe (Card)</span>
            </label>

            {method === "stripe" && (
              <div className="space-y-3">
                {!clientSecret && (
                  <div className="pl-6 text-xs text-slate-500 dark:text-slate-400">
                    Click the Place order button to enter card details.
                  </div>
                )}
                {clientSecret && (
                  <StripeCheckoutForm
                    cardholderName={cardholderName}
                    onCardholderNameChange={setCardholderName}
                  />
                )}
              </div>
            )}

            <label className="flex items-center gap-3 text-sm">
              <input
                type="radio"
                checked={method === "paypal"}
                onChange={() => setMethod("paypal")}
              />
              <span className="font-medium">PayPal</span>
            </label>

            {method === "paypal" && (
              <div className="pl-6 text-xs text-slate-500 dark:text-slate-400">
                You will be redirected to PayPal to complete payment.
              </div>
            )}

            <label className="flex items-center gap-3 text-sm">
              <input
                type="radio"
                checked={method === "momo"}
                onChange={() => setMethod("momo")}
              />
              <span className="font-medium">MoMo</span>
            </label>

            {method === "momo" && (
              <div className="pl-6 text-xs text-slate-500 dark:text-slate-400">
                You will be redirected to MoMo to complete payment.
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4 sm:p-6">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-3">Order details</h2>
          <div className="space-y-3">
            {selectedItems.map((item) => (
              <div key={item.id} className="flex gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="w-20 h-14 bg-slate-200 dark:bg-slate-800 relative rounded overflow-hidden">
                  <Image
                    src={normalizeMediaUrl(item.course.thumbnail) || "/placeholder.jpg"}
                    alt={item.course.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold line-clamp-2">{item.course.title}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {item.course.instructor?.name || "Unknown"}
                  </div>
                </div>
                <div className="text-sm font-semibold">
                  {formatMoney(currency === "USD" ? Number(item.priceSnapshot) / VND_PER_USD : Number(item.priceSnapshot))}
                </div>
              </div>
            ))}
            {selectedItems.length === 0 && <div className="text-sm text-slate-500">No selected items.</div>}
          </div>
        </div>
      </div>

      <div className="lg:col-span-4">
        <div className="sticky top-20 sm:top-24 bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-lg border border-slate-200 dark:border-slate-800">
          <div className="text-slate-500 dark:text-slate-400 font-bold text-base sm:text-lg mb-2">Order summary</div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-slate-500 dark:text-slate-400">Subtotal</span>
            <span className="font-semibold">{formatMoney(displayTotal)}</span>
          </div>
          <div className="flex items-center justify-between text-sm mb-4">
            <span className="text-slate-500 dark:text-slate-400">Total</span>
            <span className="font-bold text-purple-700 dark:text-purple-400">
              {formatMoney(displayTotal)}
            </span>
          </div>
          {method === "stripe" ? (
            clientSecret ? (
              <StripePayButton
                clientSecret={clientSecret}
                cardholderName={cardholderName}
                disabled={paying || checkingStatus}
                onSuccess={() => {
                  if (!orderId) {
                    toast.error("Missing order id for confirmation.");
                    return;
                  }
                  startOrderStatusPolling(orderId);
                }}
              />
            ) : (
              <Button
                onClick={handleStripeStart}
                disabled={paying}
                className="w-full bg-purple-600 hover:bg-purple-700 h-11 sm:h-12 text-sm sm:text-lg"
              >
                {paying ? "Preparing..." : "Place order"}
              </Button>
            )
          ) : method === "paypal" ? (
            <Button
              onClick={handlePaypalStart}
              disabled={paying}
              className="w-full bg-purple-600 hover:bg-purple-700 h-11 sm:h-12 text-sm sm:text-lg"
            >
              {paying ? "Preparing..." : "Pay with PayPal"}
            </Button>
          ) : (
            <Button className="w-full bg-purple-600 hover:bg-purple-700 h-11 sm:h-12 text-sm sm:text-lg">
              Place order
            </Button>
          )}
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-3">
            Stripe payments are confirmed by webhook before orders become PAID.
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="mb-4">
        <Link href="/cart" className="text-sm text-purple-600 hover:underline">
          Back to cart
        </Link>
      </div>

      <h1 className="text-xl sm:text-2xl font-bold mb-4 text-slate-900 dark:text-white">Checkout</h1>

      {loading && <div className="text-center text-slate-500">Loading checkout...</div>}
      {error && <div className="text-center text-red-500">{error}</div>}

      {!loading && !error && (
        clientSecret && method === "stripe" ? (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            {checkoutGrid}
          </Elements>
        ) : (
          checkoutGrid
        )
      )}
    </div>
  );
}
