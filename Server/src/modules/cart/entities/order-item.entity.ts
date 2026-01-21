import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "../../../common/entities/base.entity";
import { Order } from "./order.entity";
import { Course } from "../../courses/entities/course.entity";

@Entity("order_items")
export class OrderItem extends BaseEntity{
    @Column()
    orderId:number 

    @Column()
    courseId:number

    @Column({type:"decimal",precision:10,scale:2})
    priceSnapshot:number


    @ManyToOne(()=>Order)
    @JoinColumn({name:"orderId"})
    order:Order

    @ManyToOne(()=>Course)
    @JoinColumn({name:"courseId"})
    course:Course
}