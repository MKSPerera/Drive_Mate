import { Controller, Get, Param, Put, Body, UseGuards, Req, ForbiddenException, Post, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { CreateBusyDateDto } from './dto/create-busy-date.dto';
import { DriverAuthGuard } from '../driver/guards/driver-auth.guard';

@Controller('calendar')
@UseGuards(DriverAuthGuard)
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  // Get availability for the authenticated driver
  @Get()
  async getAvailability(@Req() req) {
    const driverId = req.user.driverId;
    return this.calendarService.getDriverAvailability(driverId);
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

  // Add a new busy date
  @Post('busy-dates')
  @HttpCode(HttpStatus.CREATED)
  async addBusyDate(@Body() createBusyDateDto: CreateBusyDateDto, @Req() req) {
    const driverId = req.user.driverId;
    return this.calendarService.addBusyDate(driverId, createBusyDateDto);
  }

  // Delete a busy date
  @Delete('busy-dates/:id')
  @HttpCode(HttpStatus.OK)
  async deleteBusyDate(@Param('id') id: number, @Req() req) {
    // Verify ownership before deletion
    const availability = await this.calendarService.getAvailabilityById(id);
    if (availability.driverId !== req.user.driverId) {
      throw new ForbiddenException('You can only delete your own busy dates');
    }
    return this.calendarService.deleteBusyDate(id);
  }

    // Update the getAvailabilityById method parameter type
    async getAvailabilityById(@Param('id') id: string) {
      const availabilityId = parseInt(id, 10);
      return this.calendarService.getAvailabilityById(availabilityId);
    }
}
