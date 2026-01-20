import { Entity, Column, OneToMany } from "typeorm";
import { BaseEntity } from "../../../common/entities/base.entity";
import { OrderItem } from "./order-item.entity";

export enum OrderStatus{
    PAID="PAID",
    FAILED="FAILED",
}
@Entity("orders")
export class Order extends BaseEntity{
    @Column()
    userId:number

    @Column({type:"decimal",precision:10,scale:2})
    totalAmount:number 

    @Column({type:"enum",enum:OrderStatus,default:OrderStatus.PAID})
    status:OrderStatus

    @Column()
    paymentMethod:string

    @OneToMany(()=>OrderItem,(item)=>item.order)
    items:OrderItem[]
}