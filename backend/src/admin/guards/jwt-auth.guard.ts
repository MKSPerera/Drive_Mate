import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}

// // Usage example in a protected route:
// @UseGuards(JwtAuthGuard)
// @Get('dashboard')
// getDashboard() {
//   return { message: 'Welcome to admin dashboard' };
// }