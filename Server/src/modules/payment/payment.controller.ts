import { Body, Controller, Headers, Post, Req } from "@nestjs/common";
import type { Request } from "express";
import { PaymentService } from "./payment.service";
import { CartService } from "../cart/cart.service";
import axios from "axios";
@Controller("payment")
export class PaymentController{
    constructor(
        private readonly paymentService:PaymentService,
        private readonly cartService: CartService
    ){}
    //1.Create Payment Intent
    @Post("stripe/create-intent")
    async createPaymentIntent(@Body() dto:{orderId:number,amount:number}){
        const intent = await this.paymentService.createPaymentIntent(dto.amount,dto.orderId)
        return {clientSecret:intent.client_secret}
    }

    //2.Stripe Webhook
    @Post("stripe/webhook")
    async stripeWebhook(@Req() req:Request,@Headers("stripe-signature") signature:string){
        const rawBody = (req as any).rawBody
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/5b48d651-031a-4992-b459-29ae3cf4b327',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'payment.controller.ts:stripeWebhook:enter',message:'Stripe webhook hit',data:{hasSignature:!!signature,rawBodyLength:rawBody?.length || 0},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H3'})}).catch(()=>{});
        // #endregion agent log

        let event: any;
        try {
            event = this.paymentService.verifyWebhook(rawBody,signature)
        } catch (err:any) {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/5b48d651-031a-4992-b459-29ae3cf4b327',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'payment.controller.ts:stripeWebhook:verifyError',message:'Stripe webhook verify failed',data:{errorMessage:err?.message || 'unknown'},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H3'})}).catch(()=>{});
            // #endregion agent log
            throw err;
        }

        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/5b48d651-031a-4992-b459-29ae3cf4b327',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'payment.controller.ts:stripeWebhook',message:'Stripe webhook received',data:{eventType:event?.type,orderId:(event?.data?.object as any)?.metadata?.orderId || null},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H3'})}).catch(()=>{});
        // #endregion agent log

        if(event.type === "payment_intent.succeeded"){
            const intent = event.data.object as any
            const orderId = parseInt(intent.metadata.orderId)
            await this.cartService.confirmPaymentByOrderId(orderId,"STRIPE")
        }
        return {received:true}
    }

    //3.PayPal Payment
    @Post("paypal/create-order")
    async createPaypalOrder(@Body() dto:{orderId:number,amount:number}){
        const accessToken = await this.paymentService.getPayPalAccessToken()

        const res = await axios.post(
            `${process.env.PAYPAL_BASE_URL}/v2/checkout/orders`,
            {
                intent:"CAPTURE",
                purchase_units:[{
                    reference_id: dto.orderId.toString(),
                    amount:{
                        currency_code:"USD",
                        value: dto.amount.toFixed(2)
                    }
                }]
            },
            {headers:{Authorization:`Bearer ${accessToken}`}}
        )
        return res.data
    }
    @Post("paypal/capture")
    async capturePaypal(@Body() dto:{ paypalOrderId:string, orderId:number }) {
    const accessToken = await this.paymentService.getPayPalAccessToken();

    await axios.post(
        `${process.env.PAYPAL_BASE_URL}/v2/checkout/orders/${dto.paypalOrderId}/capture`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    return this.cartService.confirmPaymentByOrderId(dto.orderId, "PAYPAL");
    }
}