import { SetMetadata } from '@nestjs/common';

export enum Role {
  USER = 'user',
  TEACHER = 'teacher',
  ADMIN = 'admin',
}

export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);