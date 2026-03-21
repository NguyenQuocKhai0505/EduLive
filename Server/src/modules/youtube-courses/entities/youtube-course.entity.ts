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

  /** Nhóm hiển thị tab trên Student (vd: "Programming Language", "Web") */
  @Column({ type: "varchar", length: 120, nullable: true })
  category: string | null;
}
