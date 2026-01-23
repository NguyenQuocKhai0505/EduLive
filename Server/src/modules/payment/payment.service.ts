import { BadRequestException } from "@nestjs/common";
import Stripe from "stripe"
import axios from "axios";
export class PaymentService{
    private stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: "2025-12-15.clover",
      });

    async createPaymentIntent(amount:number,orderId:number){
        const roundedAmount = Math.round(amount);
        const minimumVndAmount = 12000;
        if (roundedAmount < minimumVndAmount) {
            throw new BadRequestException(`Amount too small. Minimum is ${minimumVndAmount} VND.`);
        }
        return this.stripe.paymentIntents.create({
            amount: roundedAmount, //VND
            currency:"vnd",
            metadata:{orderId: orderId.toString()}
        })
    }
    verifyWebhook(rawBody:Buffer, signature:string){
        return this.stripe.webhooks.constructEvent(
            rawBody,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        )
    }
    async getPayPalAccessToken(){
        const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString("base64")
        const res = await axios.post(
            `${process.env.PAYPAL_BASE_URL}/v1/oauth2/token`,
            "grant_type=client_credentials",
            {
                headers:{
                    "Content-Type":"application/x-www-form-urlencoded",
                    "Authorization":`Basic ${auth}`
                }
            }
        )
        return res.data.access_token
    }
}