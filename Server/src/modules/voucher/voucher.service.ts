import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ILike, Repository } from "typeorm";
import { Voucher } from "./entities/voucher.entity";

@Injectable()
export class VoucherService{
    constructor(
        @InjectRepository(Voucher)
        private readonly voucherRepository: Repository<Voucher>
    ){}
    async validateVoucher(code:string,cartTotal:number){
        const normalized = code.trim().toUpperCase()

        const voucher = await this.voucherRepository.findOne({
            //ILIKE: khong phan biet hoa thuong
            where:{code:ILike(normalized)}
        })
        if(!voucher || !voucher.isActive){
            return {valid:false,code:null,discountPercent:0, discountAmount:0, message:"Voucher is invalid"}
        }
        if(voucher.expiresAt && voucher.expiresAt.getTime() <Date.now()){
            return {valid:false, code:null, discountPercent:0, discountAmount:0, message:"Voucher has expired"}
        }
        if(voucher.minTotal && cartTotal < voucher.minTotal){
            return {valid:false, code:null, discountPercent:0, discountAmount:0, message:`Minimum order is ${Number(voucher.minTotal).toLocaleString("vi-VN")}d`}
        }
        const discountAmount = Math.round((Number(cartTotal)*voucher.discountPercent)/100)

        return { valid: true, code: voucher.code, discountPercent: voucher.discountPercent, discountAmount };
    }
}