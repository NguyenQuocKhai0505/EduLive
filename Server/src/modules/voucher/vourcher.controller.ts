import { Body, Controller, Post } from "@nestjs/common";
import { VoucherService } from "./voucher.service";
import { ValidateVoucherDto } from "./dto/validate-voucher.dto";

@Controller("voucher")
export class VoucherController{
    constructor(private readonly voucherService:VoucherService){}

    @Post("validate")
    validate(@Body() dto:ValidateVoucherDto){
        return this.voucherService.validateVoucher(dto.code,dto.cartTotal)
    }
}
