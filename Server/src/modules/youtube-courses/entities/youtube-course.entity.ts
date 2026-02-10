import { Entity, Column } from "typeorm";
import { BaseEntity } from "../../../common/entities/base.entity";

@Entity("youtube_courses")
export class YoutubeCourse extends BaseEntity {
  @Column({ type: "varchar" })
  title: string;

  @Column({ type: "varchar" })
  author: string;

  @Column({ type: "text", nullable: true })
  tags: string | null;

  @Column({ type: "varchar" })
  videoUrl: string;

  @Column({ type: "varchar", nullable: true })
  thumbnailUrl: string | null;

  @Column({ type: "varchar", nullable: true })
  durationLabel: string | null;
}
