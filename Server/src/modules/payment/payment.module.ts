import {Module} from "@nestjs/common";
import {PaymentController} from "./payment.controller";
import {PaymentService} from "./payment.service";
import { CartModule } from "../cart/cart.module";
import { AuthModule } from "../auth/auth.module";

@Module({
    imports:[CartModule, AuthModule],
    controllers:[PaymentController],
    providers:[PaymentService],
    exports:[PaymentService],
})
export class PaymentModule {}