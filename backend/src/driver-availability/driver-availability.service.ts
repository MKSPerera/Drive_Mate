import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DriverAvailabilityService {
  constructor(private prisma: PrismaService) {}

  async findAvailableDrivers(startDate: Date, endDate: Date) {
    // Step 1: Find drivers with conflicting availabilities
    const conflictingDrivers = await this.prisma.availability.findMany({
      where: {
        OR: [
          {
            startDate: { lte: endDate },
            endDate: { gte: startDate },
          },
        ],
      },
      select: { driverId: true },
    });

    const conflictingDriverIds = conflictingDrivers.map((d) => d.driverId);

    // Step 2: Get all drivers excluding the ones with conflicts
    const availableDrivers = await this.prisma.driver.findMany({
      where: {
        id: { notIn: conflictingDriverIds },
      },
      include: {
        driverRanking: true
      }
    });

    // Sort drivers by average rating
    return availableDrivers.sort((a, b) => {
      const ratingA = a.driverRanking?.[0]?.averageRate || 0;
      const ratingB = b.driverRanking?.[0]?.averageRate || 0;
      return ratingB - ratingA;
    });
  }
}
