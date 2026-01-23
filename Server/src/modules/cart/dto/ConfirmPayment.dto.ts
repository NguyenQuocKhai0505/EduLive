
import { IsNumber, IsString } from "class-validator";

export class ConfirmPaymentDto{
    @IsNumber()
    orderId:number

    @IsString()
    method:string
}
