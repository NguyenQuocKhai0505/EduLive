import { IsArray, ArrayNotEmpty, IsInt, IsOptional, IsString } from "class-validator";
import { Type } from "class-transformer";

export class CheckoutDto{
    @IsString()
    //Client gui de chong chechout duplicate
    idempotencyKey:string

    @IsOptional()
    @IsArray()
    @ArrayNotEmpty()
    @Type(() => Number)
    @IsInt({ each: true })
    courseIds?: number[]
}