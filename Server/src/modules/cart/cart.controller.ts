import { Controller, Post, Get, Delete, Param, Body, UseGuards, Req, ParseIntPipe } from "@nestjs/common";
import { CartService } from "./cart.service";
import { AuthGuard } from "../guards/auth.guard";
import { AddToCartDto } from "./dto/AddToCart.dto";
import { CheckoutDto } from "./dto/Checkout.dto";

@Controller("cart")
@UseGuards(AuthGuard)
export class CartController{
    constructor(private readonly cartService:CartService){}

    @Post()
    addToCart(@Req() req:any,@Body() dto:AddToCartDto){
        return this.cartService.addToCart(req.user.sub,dto.courseId)
    }

    @Get()
    getCartItems(@Req() req:any){
        return this.cartService.getCartItems(req.user.sub)
    }

    @Delete(":courseId")
    removeFromCart(@Req() req:any,@Param("courseId",ParseIntPipe) courseId:number){
        return this.cartService.removeFromCart(req.user.sub,courseId)
    }

    @Get("status/:courseId")
    status(@Req() req:any,@Param("courseId",ParseIntPipe) courseId:number){
        return this.cartService.checkStatus(req.user.sub,courseId)
    }

    @Get("order/:orderId")
    orderStatus(@Req() req:any, @Param("orderId", ParseIntPipe) orderId:number){
        return this.cartService.getOrderStatus(req.user.sub, orderId);
    }

    @Post("checkout")
    checkout(@Req() req:any, @Body() dto:CheckoutDto){
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/5b48d651-031a-4992-b459-29ae3cf4b327',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'cart.controller.ts:checkout',message:'Checkout endpoint hit',data:{userId:req?.user?.sub,idempotencyKey:dto?.idempotencyKey,courseIdsCount:dto?.courseIds?.length || 0},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H1'})}).catch(()=>{});
        // #endregion agent log
        return this.cartService.checkout(req.user.sub, dto.idempotencyKey, dto.courseIds)
    }
}