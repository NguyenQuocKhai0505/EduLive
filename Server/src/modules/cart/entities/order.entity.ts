import { Entity, Column, OneToMany } from "typeorm";
import { BaseEntity } from "../../../common/entities/base.entity";
import { OrderItem } from "./order-item.entity";

export enum OrderStatus{
    PENDING="PENDING",
    PAID="PAID",
    FAILED="FAILED",
}
@Entity("orders")
export class Order extends BaseEntity{
    @Column()
    userId:number

    @Column({type:"decimal",precision:10,scale:2})
    totalAmount:number 

    @Column({type:"enum",enum:OrderStatus,default:OrderStatus.PENDING})
    status:OrderStatus

    @Column()
    paymentMethod:string

    //IdempotencyKey de tranh lap lai giao dich
    @Column({ unique: true })
    idempotencyKey: string;

    @OneToMany(()=>OrderItem,(item)=>item.order)
    items:OrderItem[]
}