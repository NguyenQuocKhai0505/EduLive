import {
  Controller,
  Get,
  Post,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { AuthGuard } from '../guards/auth.guard';

@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly service: EnrollmentsService) {}

  /** Tiến độ hoàn thành bài học (lessonId đã xong). Phải đặt trước route `:courseId` để không bị nuốt path. */
  @Get('progress/:courseId')
  @UseGuards(AuthGuard)
  getProgress(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Req() req: any,
  ) {
    return this.service.getLessonProgress(req.user.sub, courseId);
  }

  @Post('progress/:courseId/lessons/:lessonId/complete')
  @UseGuards(AuthGuard)
  markLessonComplete(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('lessonId', ParseIntPipe) lessonId: number,
    @Req() req: any,
  ) {
    return this.service.markLessonComplete(req.user.sub, courseId, lessonId);
  }

  @Post(':courseId')
  @UseGuards(AuthGuard)
  enroll(@Param('courseId', ParseIntPipe) courseId: number, @Req() req: any) {
    return this.service.enroll(req.user.sub, courseId);
  }

  @Get('my')
  @UseGuards(AuthGuard)
  getMyCourses(@Req() req: any) {
    return this.service.getMyCourses(req.user.sub);
  }
}
