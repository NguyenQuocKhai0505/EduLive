import {IsString} from "class-validator";

export class CheckoutDto{
    @IsString()
    //Client gui de chong chechout duplicate
    idempotencyKey:string
}