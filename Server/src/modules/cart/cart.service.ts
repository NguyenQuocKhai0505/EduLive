import { Injectable, BadRequestException,NotFoundException } from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository,DataSource} from "typeorm";
import { CartItem } from "./entities/cart-item.entity";
import { Order, OrderStatus } from "./entities/order.entity";
import { OrderItem } from "./entities/order-item.entity";
import { Course } from "../courses/entities/course.entity";
import { CartStatus } from "./enums/cart-status.enum";
import { CheckoutDto } from "./dto/Checkout.dto";

@Injectable()
export class CartService{
    constructor(
        @InjectRepository(CartItem)
        private readonly cartItemRepository:Repository<CartItem>,
        @InjectRepository(Order)
        private readonly orderRepository:Repository<Order>,
        @InjectRepository(OrderItem)
        private readonly orderItemRepository:Repository<OrderItem>,
        @InjectRepository(Course)
        private readonly courseRepository:Repository<Course>,
        private readonly dataSource: DataSource
    ){}

    //1.ADD TO CART 
    async addToCart(userId:number,courseId:number){
        const course = await this.courseRepository.findOne({where:{id:courseId}})
        if(!course) throw new NotFoundException("Course not found")
        
        const existing = await this.cartItemRepository.findOne({where:{userId,courseId}})

        if(existing?.status === CartStatus.PURCHASED) throw new BadRequestException("Course already purchased")
        
        if(existing?.status === CartStatus.IN_CART) throw new BadRequestException("Course already in cart")

        const cartItem = this.cartItemRepository.create({
            userId,
            courseId,
            status:CartStatus.IN_CART, //default in cart
            priceSnapshot:Number(course.price)
        })
        //Luu vao db
        return this.cartItemRepository.save(cartItem)

    }

    //2.GET CART ITEMS
    async getCartItems(userId:number){
        return this.cartItemRepository.find({
            where:{userId,status:CartStatus.IN_CART},
            relations:["course"],
            order:{createdAt:"DESC"}
        })
    }
    //3.REMOVE FROM CART 
    async removeFromCart(userId:number,courseId:number){
        //Xoa khoi db
        return this.cartItemRepository.delete({userId,courseId,status:CartStatus.IN_CART})
    }

    //4.CHECK STATUS
    async checkStatus(userId:number,courseId:number){
        const item = await this.cartItemRepository.findOne({where:{userId,courseId}})
        return {
            inCart: item?.status === CartStatus.IN_CART,
            purchased: item?.status === CartStatus.PURCHASED,
        }
    }

    //5.CHECKOUT
    async checkout(userId: number, idempotencyKey: string) {
        // itempotencyKey: neu key da co -> tra ve order cu

        const existingOrder = await this.orderRepository.findOne({ where: { idempotencyKey } });
        if (existingOrder) return existingOrder;


        const cartItems = await this.cartItemRepository.find({
            where:{userId,status:CartStatus.IN_CART}
        })

        if(cartItems.length ===0) throw new BadRequestException("No items in cart")

        //TRANSACTION
        return await this.dataSource.transaction(async (manager) => {
            const total = cartItems.reduce((sum, item) => sum + Number(item.priceSnapshot), 0);

            // Lock/validate slots per course to avoid race condition
            for (const item of cartItems) {
                const course = await manager.findOne(Course, { where: { id: item.courseId } });
                if (!course) {
                    throw new NotFoundException("Course not found");
                }

                // If availableSlots is set, enforce capacity with atomic update
                if (course.availableSlots !== null) {
                    if (course.availableSlots <= 0) {
                        throw new BadRequestException("Course is out of slots");
                    }

                    const result = await manager
                        .createQueryBuilder()
                        .update(Course)
                        .set({ availableSlots: () => "availableSlots - 1" })
                        .where("id = :id AND availableSlots > 0", { id: course.id })
                        .execute();

                    if (!result.affected) {
                        throw new BadRequestException("Course is out of slots");
                    }
                }
            }
    
            const order = manager.create(Order, {
            userId,
            totalAmount: total,
            status: OrderStatus.PAID,
            paymentMethod: "MOCK",
            idempotencyKey,
            });
            const savedOrder = await manager.save(order)

            const orderItems = cartItems.map((item)=>
                manager.create(OrderItem,{
                    orderId:savedOrder.id,
                    courseId:item.courseId,
                    priceSnapshot:item.priceSnapshot
                })
            )
            await manager.save(orderItems)

            await manager.update(
                CartItem,
                {userId,status:CartStatus.IN_CART},
                {status:CartStatus.PURCHASED}
            )
            return savedOrder
        })
    }
}
