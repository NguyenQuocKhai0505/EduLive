import { Controller, Get, Post, Param, ParseIntPipe, UseGuards, Req } from "@nestjs/common";
import { EnrollmentsService } from "./enrollments.service";
import { AuthGuard } from "../guards/auth.guard";

@Controller("enrollments")
export class EnrollmentsController{
    constructor(private readonly service: EnrollmentsService){}

    @Post(":courseId")
    @UseGuards(AuthGuard)
    enroll(@Param("courseId",ParseIntPipe) courseId: number, @Req() req:any){
        return this.service.enroll(req.user.sub,courseId)
    }
    @Get("my")
    @UseGuards(AuthGuard)
    getMyCourses(@Req() req:any){
        return this.service.getMyCourses(req.user.sub)
    }
}