import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

@Injectable()
export class RolesGuard implements CanActivate{
    constructor(private reflector: Reflector){}

     async canActivate(context: ExecutionContext): Promise<boolean> {
        //Lay danh sach Role duoc phep tu Decorator @Roles()
        const requireRoles = this.reflector.getAllAndOverride<string[]>("roles",[
            context.getHandler(),
            context.getClass()
        ])
        // Nếu API không yêu cầu quyền cụ thể (ví dụ Student page), cho phép vào luôn
        if(!requireRoles){
            return true 
        }

        // 2. Lấy thông tin user đã được AuthGuard "đính kèm" vào request ở bước trước
        const {user } = context.switchToHttp().getRequest()

        // 3. So sánh Role của User với Role yêu cầu của API
        const hasRole = requireRoles.some((role) => user.role === role)
        if(!hasRole) throw new ForbiddenException("You do not have access.")
        return true 
    }
}