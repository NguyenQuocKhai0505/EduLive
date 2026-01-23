import {IsNumber, IsString,Min} from "class-validator";

export class ValidateVoucherDto{
    @IsString()
    code:string

    @IsNumber()
    @Min(0)
    cartTotal:number
}