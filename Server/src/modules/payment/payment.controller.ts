import { Body, Controller, Headers, Post, Req,UseGuards} from "@nestjs/common";
import type { Request } from "express";
import { PaymentService } from "./payment.service";
import { CartService } from "../cart/cart.service";
import {AuthGuard} from "../guards/auth.guard";
import axios from "axios";
@Controller("payment")
export class PaymentController{
    constructor(
        private readonly paymentService:PaymentService,
        private readonly cartService: CartService
    ){}
    //1.Create Payment Intent
    @Post("stripe/create-intent")
    @UseGuards(AuthGuard)
    async createPaymentIntent(@Req() req: any, @Body() dto: { orderId: number }) {
      const userId = req.user.sub;
      const order = await this.cartService.getPendingOrderForPayment(userId, dto.orderId);
    
      const amount = Number(order.totalAmount);
      const intent = await this.paymentService.createPaymentIntent(amount, order.id);
    
      return { clientSecret: intent.client_secret };
    }

    //2.Stripe Webhook
    @Post("stripe/webhook")
    async stripeWebhook(@Req() req: Request, @Headers("stripe-signature") signature: string) {
      const rawBody: Buffer | undefined = (req as any).rawBody;
      if (!rawBody || rawBody.length === 0) {
        console.error("[Stripe Webhook] rawBody is missing. Ensure main.ts uses rawBody: true.");
        return { received: false, error: "rawBody missing" };
      }
    
      let event: any;
      try {
        event = this.paymentService.verifyWebhook(rawBody, signature);
      } catch (err: any) {
        console.error("[Stripe Webhook] verify failed:", err?.message || err);
        throw err;  
      }
    
      const intent = event?.data?.object as any;
      const orderId = Number(intent?.metadata?.orderId);
    
      if (Number.isFinite(orderId)) {
        if (event.type === "payment_intent.succeeded") {
          await this.cartService.confirmPaymentByOrderId(orderId, "STRIPE");
        }
    
        if (event.type === "payment_intent.payment_failed") {
          await this.cartService.markPaymentFailedByOrderId(orderId);
        }
      }
    
      return { received: true };
    }


    //3.PayPal Payment
    @Post("paypal/create-order")
    @UseGuards(AuthGuard)
    async createPaypalOrder(@Req() req: any, @Body() dto: { orderId: number }) {
      const userId = req.user.sub;
      const order = await this.cartService.getPendingOrderForPayment(userId, dto.orderId);
    
      const amountVnd = Number(order.totalAmount);
      const VND_PER_USD = 25000;
      const amountUsd = Number((amountVnd / VND_PER_USD).toFixed(2));
    
      const accessToken = await this.paymentService.getPayPalAccessToken();
    
      const res = await axios.post(
        `${process.env.PAYPAL_BASE_URL}/v2/checkout/orders`,
        {
          intent: "CAPTURE",
          purchase_units: [{
            reference_id: order.id.toString(),
            amount: { currency_code: "USD", value: amountUsd.toFixed(2) }
          }]
        },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
    
      return res.data;
    }
    @Post("paypal/capture")
    @UseGuards(AuthGuard)
    async capturePaypal(@Req() req: any, @Body() dto: { paypalOrderId: string, orderId: number }) {
    
    const userId = req.user.sub 
    const order = await this.cartService.getPendingOrderForPayment(userId,dto.orderId)


    const accessToken = await this.paymentService.getPayPalAccessToken();

    await axios.post(
        `${process.env.PAYPAL_BASE_URL}/v2/checkout/orders/${dto.paypalOrderId}/capture`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    return this.cartService.confirmPaymentByOrderId(order.id, "PAYPAL");
    }
}