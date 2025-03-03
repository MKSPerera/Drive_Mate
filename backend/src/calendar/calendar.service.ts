import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';

@Injectable()
export class CalendarService {
  constructor(private readonly prisma: PrismaService) {}

  // Get all availability records for the calendar
  async getDriverAvailability(driverId: number) {
    return this.prisma.availability.findMany({
      where: { driverId: Number(driverId) },
      select: {
        jobId: true,
        startDate: true,
        endDate: true,
        status: true,
      },
    });
  }

  // Update availability (e.g., marking a driver busy/unavailable)
  async updateAvailability(id: number, updateDto: UpdateAvailabilityDto) {
    const availability = await this.prisma.availability.findUnique({ where: { id } });

    if (!availability) {
      throw new NotFoundException('Availability record not found');
    }

    return this.prisma.availability.update({
      where: { id },
      data: updateDto,
    });
  }

  async getAvailabilityById(id: number) {
    const availability = await this.prisma.availability.findUnique({
      where: { id },
    });
    
    if (!availability) {
      throw new NotFoundException('Availability record not found');
    }
    
    return availability;
  }
}
