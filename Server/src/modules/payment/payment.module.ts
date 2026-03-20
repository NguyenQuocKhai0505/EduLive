import {Module} from "@nestjs/common";
import {PaymentController} from "./payment.controller";
import {PaymentService} from "./payment.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CartModule } from "../cart/cart.module";
import { AuthModule } from "../auth/auth.module";
import { AuthGuard } from "../guards/auth.guard";

@Module({
    imports:[CartModule, AuthModule],
    controllers:[PaymentController],
    providers:[PaymentService, AuthGuard],
    exports:[PaymentService],
})
export class PaymentModule {}