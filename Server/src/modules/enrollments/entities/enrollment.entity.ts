

import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "../../../common/entities/base.entity";
import { User } from "../../users/entities/user.entity";
import { Course } from "../../courses/entities/course.entity";


@Entity("enrollments")
export class Enrollment extends BaseEntity{
    @Column()
    userId: number

    @Column()
    courseId: number

    @ManyToOne(()=> User,{onDelete:"CASCADE"})
    @JoinColumn({name:"userId"})
    user:User

    @ManyToOne(()=>Course,{onDelete:"CASCADE"})
    @JoinColumn({name:"courseId"})
    course: Course
}