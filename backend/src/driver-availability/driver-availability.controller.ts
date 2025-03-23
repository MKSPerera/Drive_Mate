import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { DriverAvailabilityService } from './driver-availability.service';
import { JwtAuthGuard } from '../admin/guards/jwt-auth.guard';

@Controller('drivers')
export class DriverAvailabilityController {
  constructor(private readonly driverAvailabilityService: DriverAvailabilityService) {}

  @Post('available')
  @UseGuards(JwtAuthGuard)
  async getAvailableDrivers(@Body() body: { startDate: string; endDate: string }) {
    const start = new Date(body.startDate);
    const end = new Date(body.endDate);

    return this.driverAvailabilityService.findAvailableDrivers(start, end);
  }
}
