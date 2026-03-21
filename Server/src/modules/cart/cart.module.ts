import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CartItem } from "./entities/cart-item.entity";
import { Order } from "./entities/order.entity";
import { OrderItem } from "./entities/order-item.entity";
import { Course } from "../courses/entities/course.entity";
import { Enrollment } from "../enrollments/entities/enrollment.entity";
import { CartService } from "./cart.service";
import { CartController } from "./cart.controller";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [TypeOrmModule.forFeature([CartItem, Order, OrderItem, Course, Enrollment]), AuthModule],
  providers: [CartService],
  controllers: [CartController],
  exports: [CartService],
})
export class CartModule {}