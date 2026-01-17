import { Entity, Column, OneToMany } from "typeorm";
import { BaseEntity } from "../../../common/entities/base.entity";
import { Course } from "./course.entity";

@Entity("categories")
/**
 * ENTITY: Category
 * 
 * MỤC ĐÍCH: Lưu trữ thông tin các thể loại khóa học
 * 
 * VÍ DỤ: "Data Science", "Web Development", "Mobile App"
 * 
 * QUAN HỆ: 
 * - OneToMany với Course (1 category có nhiều courses)
 */
export class Category extends BaseEntity{
    @Column()
    name:string

    @Column({unique:true,nullable:true})
    slug:string

    @Column({type:"text",nullable:true})
    description:string

    @Column({nullable:true})
    icon:string

    @Column({nullable:true})
    image:string

    @Column({nullable:true})
    color:string 

    @Column({default:true})
    isActive:boolean

    @Column({default:0})
    courseCount:number

    //Mot category co the co nhieu khoa hoc
    @OneToMany(()=>Course, (course)=>course.category)
    courses:Course[]
}