import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class DriverAuthGuard extends AuthGuard('driver-jwt') {
  handleRequest(err: any, user: any, info?: any) {
    if (err) {
      throw err;
    }
    if (!user) {
      throw new UnauthorizedException(info?.message || 'Unauthorized access');
    }
    return user;
  }
}
