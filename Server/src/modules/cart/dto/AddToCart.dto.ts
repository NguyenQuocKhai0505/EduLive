import { IsNumber } from "class-validator";

export class AddToCartDto{
    @IsNumber()
    courseId:number
}