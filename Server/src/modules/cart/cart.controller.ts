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

    @Post("checkout")
    checkout(@Req() req:any, @Body() dto:CheckoutDto){
        return this.cartService.checkout(req.user.sub,dto.idempotencyKey)
    }
}