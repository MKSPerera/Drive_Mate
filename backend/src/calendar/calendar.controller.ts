import { Controller, Get, Param, Put, Body, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { DriverAuthGuard } from '../driver/guards/driver-auth.guard';

@Controller('calendar')
@UseGuards(DriverAuthGuard)
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  // Get availability for a specific driver
  @Get(':driverId')
  async getAvailability(@Param('driverId') driverId: string, @Req() req) {
    // Ensure drivers can only access their own calendar
    if (req.user.driverId !== parseInt(driverId)) {
      throw new ForbiddenException('You can only access your own calendar');
    }
    return this.calendarService.getDriverAvailability(parseInt(driverId));
  }

  // Update availability
  @Put(':id')
  async updateAvailability(
    @Param('id') id: number, 
    @Body() updateDto: UpdateAvailabilityDto,
    @Req() req
  ) {
    // Verify ownership before update
    const availability = await this.calendarService.getAvailabilityById(id);
    if (availability.driverId !== req.user.driverId) {
      throw new ForbiddenException('You can only update your own availability');
    }
    return this.calendarService.updateAvailability(id, updateDto);
  }
}
