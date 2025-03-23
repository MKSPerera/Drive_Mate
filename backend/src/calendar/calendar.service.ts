import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { CreateBusyDateDto } from './dto/create-busy-date.dto';
import { AvailabilityStatus } from '@prisma/client';

@Injectable()
export class CalendarService {
  constructor(private readonly prisma: PrismaService) {}

  // Get all availability records for the calendar
  async getDriverAvailability(driverId: number) {
    return this.prisma.availability.findMany({
      where: { driverId: Number(driverId) },
      select: {
        id: true,
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

  //get availability by id
  async getAvailabilityById(id: number) {
    if (isNaN(id)) {
      throw new BadRequestException('Invalid availability ID');
    }

    const availability = await this.prisma.availability.findUnique({
      where: { id: parseInt(id.toString(), 10) },
    });
    
    if (!availability) {
      throw new NotFoundException('Availability record not found');
    }
    
    return availability;
  }

  // Add a new busy date for a driver
  async addBusyDate(driverId: number, busyDateDto: CreateBusyDateDto) {
    const { startDate, endDate } = busyDateDto;
    
    // Ensure dates are valid Date objects
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Validate dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException('Invalid date format');
    }

    if (start >= end) {
      throw new BadRequestException('Start date must be before end date');
    }

    // Check for overlapping busy dates or jobs
    const overlappingAvailability = await this.prisma.availability.findFirst({
      where: {
        driverId,
        OR: [
          {
            AND: [
              { startDate: { lte: end } },
              { endDate: { gte: start } }
            ]
          }
        ],
      },
    });

    if (overlappingAvailability) {
      throw new BadRequestException('This time period overlaps with an existing busy period or job');
    }

    // Create a new availability record with BUSY status
    return this.prisma.availability.create({
      data: {
        driverId,
        startDate: start,
        endDate: end,
        status: 'BUSY' as AvailabilityStatus,
      },
    });
  }

  // Delete a busy date
  async deleteBusyDate(id: number) {
    if (isNaN(id)) {
      throw new BadRequestException('Invalid availability ID');
    }

    const availability = await this.prisma.availability.findUnique({ 
      where: { id: parseInt(id.toString(), 10) } 
    });

    if (!availability) {
      throw new NotFoundException('Busy date not found');
    }

    // Only allow deletion if it's a BUSY status (not JOB)
    if (availability.status !== 'BUSY') {
      throw new BadRequestException('Cannot delete a job-related busy period');
    }

    return this.prisma.availability.delete({
      where: { id: parseInt(id.toString(), 10) },
    });
  }
}
