import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Voucher } from "./entities/voucher.entity";
import { VoucherService } from "./voucher.service";
import { VoucherController } from "./voucher.controller";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [TypeOrmModule.forFeature([Voucher]), AuthModule],
  providers: [VoucherService],
  controllers: [VoucherController],
})
export class VoucherModule {}