import {Column,Entity,PrimaryGeneratedColumn,Index} from "typeorm";
import {BaseEntity} from "../../../common/entities/base.entity";

@Entity("vouchers")
export class Voucher extends BaseEntity{
    @Index({unique:true})
    @Column()
    code:string

    @Column({type:"int"})
    discountPercent:number 

    @Column({default:true})
    isActive:boolean

    @Column({type:"timestamp",nullable:true})
    expiresAt:Date | null

    @Column({type:"decimal",precision:10, scale:2, nullable:true})
    minTotal:number | null
}