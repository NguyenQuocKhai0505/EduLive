import {Module} from "@nestjs/common";
import {PaymentController} from "./payment.controller";
import {PaymentService} from "./payment.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CartModule } from "../cart/cart.module";

@Module({
    imports:[CartModule],
    controllers:[PaymentController],
    providers:[PaymentService],
    exports:[PaymentService],
})
export class PaymentModule {}