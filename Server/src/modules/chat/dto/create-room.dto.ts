import { IsInt } from "class-validator";

export class CreateRoomDto {
  @IsInt()
  courseId: number;
}