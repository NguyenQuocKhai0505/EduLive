import { Injectable, BadRequestException,NotFoundException } from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import { In, Repository,DataSource} from "typeorm";
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

    async getOrderStatus(userId:number, orderId:number){
        const order = await this.orderRepository.findOne({ where: { id: orderId, userId } });
        if(!order) throw new NotFoundException("Order not found");
        return { status: order.status };
    }

    //5.CHECKOUT
    async checkout(userId: number, idempotencyKey: string, courseIds?: number[]) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/5b48d651-031a-4992-b459-29ae3cf4b327',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'cart.service.ts:checkout:enter',message:'Checkout start',data:{userId,idempotencyKey,courseIdsCount:courseIds?.length || 0},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H1'})}).catch(()=>{});
        // #endregion agent log
        // 1) Idempotency: nếu đã tạo order rồi, trả lại
        const existingOrder = await this.orderRepository.findOne({ where: { idempotencyKey } });
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/5b48d651-031a-4992-b459-29ae3cf4b327',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'cart.service.ts:checkout:idempotency',message:'Idempotency check',data:{hasExisting:!!existingOrder,existingOrderId:existingOrder?.id || null},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H1'})}).catch(()=>{});
        // #endregion agent log
        if (existingOrder) return existingOrder;
      
        return await this.dataSource.transaction(async (manager) => {
          // 2) Lock cart items để tránh double checkout
          /**
           * pessimistic_write đảm bảo chỉ một transaction được sửa cart items cùng lúc 
           * ⇒ ngăn người dùng bấm checkout 2 lần hoặc 2 request chạy song song.
           */
          const cartQuery = manager
            .createQueryBuilder(CartItem, "cart")
            .setLock("pessimistic_write") // FOR UPDATE
            .where("cart.userId = :userId", { userId })
            .andWhere("cart.status = :status", { status: CartStatus.IN_CART })
          
          if (courseIds && courseIds.length > 0) {
            cartQuery.andWhere("cart.courseId IN (:...courseIds)", { courseIds });
          }

          const cartItems = await cartQuery.getMany();
      
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/5b48d651-031a-4992-b459-29ae3cf4b327',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'cart.service.ts:checkout:cartItems',message:'Cart items locked',data:{cartItemsCount:cartItems.length,courseIdsCount:courseIds?.length || 0},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H2'})}).catch(()=>{});
          // #endregion agent log

          if (cartItems.length === 0) {
            throw new BadRequestException("No items in cart");
          }

          if (courseIds && cartItems.length !== courseIds.length) {
            throw new BadRequestException("Some selected items are not available in cart");
          }
      
          // 3) Tính tổng tiền
          const total = cartItems.reduce((sum, item) => sum + Number(item.priceSnapshot), 0);
      
          // 4) Lock + kiểm tra slot
          for (const item of cartItems) {
            const course = await manager.findOne(Course, {
              where: { id: item.courseId },
              lock: { mode: "pessimistic_write" }, // khóa row course
            });
      
            if (!course) throw new NotFoundException("Course not found");
      
            if (course.availableSlots !== null) {
              if (course.availableSlots <= 0) {
                throw new BadRequestException("Course is out of slots");
              }
      
              course.availableSlots -= 1;
              await manager.save(course);
            }
          }
      
          // 5) Tạo order ở trạng thái PENDING
          const order = manager.create(Order, {
            userId,
            totalAmount: total,
            status: OrderStatus.PENDING,
            paymentMethod: "PENDING",
            idempotencyKey,
          });
          const savedOrder = await manager.save(order);
      
          // 6) Tạo order items
          const orderItems = cartItems.map((item) =>
            manager.create(OrderItem, {
              orderId: savedOrder.id,
              courseId: item.courseId,
              priceSnapshot: item.priceSnapshot,
            })
          );
          await manager.save(orderItems);
      
          // 7) Chưa update CartItem -> PURCHASED ở đây
          // Chỉ update khi payment thành công
      
          return savedOrder;
        });
    }

    //6.Confirm Payment 
    async confirmPayment(userId:number,orderId:number,method:string){
        return this.dataSource.transaction(async(manager) =>{
            const order = await manager.findOne(Order, { where: { id: orderId, userId } });
            if(!order) throw new NotFoundException("Order not found");
            if(order.status === OrderStatus.PAID) return order;

            order.status = OrderStatus.PAID;
            order.paymentMethod = method;
            await manager.save(order);

            const orderItems = await manager.find(OrderItem, { where: { orderId } });
            const courseIds = orderItems.map((item) => item.courseId);
            if (courseIds.length > 0) {
                await manager.update(
                    CartItem,
                    { userId, status: CartStatus.IN_CART, courseId: In(courseIds) },
                    { status: CartStatus.PURCHASED }
                );
            }

            return order;
        });
    }

    //6b.Confirm Payment (server callback - no user context)
    async confirmPaymentByOrderId(orderId:number,method:string){
        return this.dataSource.transaction(async(manager) =>{
            const order = await manager.findOne(Order, { where: { id: orderId } });
            if(!order) throw new NotFoundException("Order not found");
            if(order.status === OrderStatus.PAID) return order;

            order.status = OrderStatus.PAID;
            order.paymentMethod = method;
            await manager.save(order);

            const orderItems = await manager.find(OrderItem, { where: { orderId } });
            const courseIds = orderItems.map((item) => item.courseId);
            if (courseIds.length > 0) {
                await manager.update(
                    CartItem,
                    { userId: order.userId, status: CartStatus.IN_CART, courseId: In(courseIds) },
                    { status: CartStatus.PURCHASED }
                );
            }

            return order;
        });
    }
}
