import { 
  Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, Req, ForbiddenException 
} from '@nestjs/common';
import { DriverService } from './driver.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { DriverAuthGuard } from './guards/driver-auth.guard';
import { JwtAuthGuard } from '../admin/guards/jwt-auth.guard';

@Controller('drivers')
export class DriverController {
  constructor(private readonly driverService: DriverService) {}

  @Post()
  create(@Body() createDriverDto: CreateDriverDto) {
    return this.driverService.create(createDriverDto);
  }

  @Post('login')
  async login(@Body() body: { contactNumber: string; password: string }) {
    return this.driverService.login(body);
  }

  @Get('profile')
  @UseGuards(DriverAuthGuard)
  async getProfile(@Req() req) {
    return this.driverService.findDriverById(req.user.driverId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  getDrivers() {
    return this.driverService.getDrivers();
  }

  @Get(':id')
  @UseGuards(DriverAuthGuard)
  async getDriver(@Param('id') id: string, @Req() req) {
    if (req.user.driverId !== parseInt(id)) {
      throw new ForbiddenException('You can only access your own profile');
    }
    return this.driverService.findDriverById(Number(id));
  }

  @Patch(':id')
  @UseGuards(DriverAuthGuard)
  async updateDriver(
    @Param('id') id: string,
    @Body() body: { firstName?: string; lastName?: string; email?: string; contactNumber?: string },
    @Req() req
  ) {
    if (req.user.driverId !== parseInt(id)) {
      throw new ForbiddenException('You can only update your own profile');
    }
    return this.driverService.updateDriver(Number(id), body);
  }

  @Delete(':id')
  @UseGuards(DriverAuthGuard)
  async deleteDriver(@Param('id') id: string, @Req() req) {
    if (req.user.driverId !== parseInt(id)) {
      throw new ForbiddenException('You can only delete your own profile');
    }
    return this.driverService.deleteDriver(Number(id));
  }
}
