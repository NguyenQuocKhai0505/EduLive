import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { BaseEntity } from "../../../common/entities/base.entity";
import { User } from "../../users/entities/user.entity";
import { Category } from "./category.entity";
import { Section } from "./section.entity";

@Entity("courses")
/**
 * ENTITY: Course
 * 
 * MỤC ĐÍCH: Lưu trữ thông tin khóa học
 * 
 * QUAN HỆ:
 * - ManyToOne với Category (nhiều courses thuộc 1 category)
 * - ManyToOne với User/instructor (nhiều courses thuộc 1 teacher)
 * - OneToMany với Section (1 course có nhiều sections/chương)
 */
export class Course extends BaseEntity{

    @Column()
    title:string

    @Column({type:"text"})
    description:string

    @Column()
    categoryId:number

    @ManyToOne(()=>Category,(category)=>category.courses)
    @JoinColumn({name:"categoryId"})
    category:Category

    @Column({nullable:true})
    thumbnail:string

    @Column({default: "Beginner"})
    level:string

    @Column({default:"English"})
    language:string

    @Column({type:"decimal",precision:10,scale:2,default:0})
    price:number 

    @Column({type:"decimal",precision:10,scale:2,default:0})
    originalPrice:number

    @OneToMany(() => Section, (section) => section.course, { cascade: true })
    sections: Section[];

    @Column({default:0})
    students:number 

    @Column({default:0})
    lectures:number 

    @Column({type:"decimal",precision:3,scale:2,default:0})
    rating:number

    @Column({default:0})
    duration:number

    // So luong slot con lai (nullable = khong gioi han)
    @Column({ type: "int", nullable: true })
    availableSlots: number | null

    //Quan he voi USER(Teacher/Admin)
    @Column()
    instructorId:number //ID cua user tao khoa hoc 

    @ManyToOne(()=>User)
    @JoinColumn({name:"instructorId"})
    instructor:User

    @Column({default:true})
    isPublished:boolean

    @Column({default:false})
    isActive:boolean
}