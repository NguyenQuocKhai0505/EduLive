import { Entity, Column, ManyToOne, JoinColumn, Unique } from "typeorm";
import { BaseEntity } from "../../../common/entities/base.entity";
import { User } from "../../users/entities/user.entity";
import { Course } from "../../courses/entities/course.entity";
import { CartStatus } from "../enums/cart-status.enum";

@Entity("cart_items")
@Unique(["userId","courseId"])
export class CartItem extends BaseEntity{
    @Column()
    userId:number 

    @Column()
    courseId:number

    @Column({type:"enum",enum:CartStatus,default:CartStatus.IN_CART})
    status:CartStatus

    @Column({type:"decimal",precision:10,scale:2})
    priceSnapshot:number //luu gia thoi diem them vao gio hang

    //Mot user co the co nhieu cart items
    @ManyToOne(()=>User)
    @JoinColumn({name:"userId"})
    user:User

    //Mot course co the co nhieu cart items
    @ManyToOne(()=>Course)
    @JoinColumn({name:"courseId"})
    course:Course
}