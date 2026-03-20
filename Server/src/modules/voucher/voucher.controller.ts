import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { VoucherService } from "./voucher.service";
import { ValidateVoucherDto } from "./dto/validate-voucher.dto";
import { AuthGuard } from "../guards/auth.guard";

@Controller("voucher")
export class VoucherController {
  constructor(private readonly voucherService: VoucherService) {}

  @Post("validate")
  @UseGuards(AuthGuard)
  validate(@Body() dto: ValidateVoucherDto) {
    return this.voucherService.validateVoucher(dto.code, dto.cartTotal);
  }
}
