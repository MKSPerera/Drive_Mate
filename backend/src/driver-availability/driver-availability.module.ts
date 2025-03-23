import { Module } from '@nestjs/common';
import { DriverAvailabilityService } from './driver-availability.service';
import { DriverAvailabilityController } from './driver-availability.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [DriverAvailabilityController],
  providers: [DriverAvailabilityService, PrismaService],
})
export class DriverAvailabilityModule {}
