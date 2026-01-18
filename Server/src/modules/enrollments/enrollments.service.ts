import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Enrollment } from "./entities/enrollment.entity";
import { Course } from "../courses/entities/course.entity";

@Injectable()
export class EnrollmentsService {
    constructor(
        @InjectRepository(Enrollment) private readonly enrollmentRepo: Repository<Enrollment>,
        @InjectRepository(Course) private readonly courseRepo: Repository<Course>
    ){}

    //ENROLL COURSE
    async enroll(userId: number,courseId: number){
        const course = await this.courseRepo.findOne({where:{id:courseId, isPublished:true,isActive:true}})
        if(!course) throw new NotFoundException("Course not found")
        
        const existed = await this.enrollmentRepo.findOne({where:{userId,courseId}})
        if(existed) throw new BadRequestException("Aldready enrolled")

        return this.enrollmentRepo.save({userId,courseId})
    }

    //GET MY COURSE 
    async getMyCourses(userId:number){
        const enrollments = await this.enrollmentRepo.find({
            where:{userId},
            relations:["course","course.instructor","course.category"],
            order:{createdAt:"DESC"}
        })
        return enrollments.map(e=>e.course)
    }
}