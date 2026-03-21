import { Entity, Column, Unique } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

/** Đánh dấu học viên đã hoàn thành một lesson (theo user + lesson). */
@Entity('lesson_completions')
@Unique(['userId', 'lessonId'])
export class LessonCompletion extends BaseEntity {
  @Column()
  userId: number;

  @Column()
  courseId: number;

  @Column()
  lessonId: number;
}
