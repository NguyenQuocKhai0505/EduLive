import { PartialType } from "@nestjs/mapped-types";
import { CreateYoutubeCourseDto } from "./create-youtube-course.dto";

export class UpdateYoutubeCourseDto extends PartialType(CreateYoutubeCourseDto) {}