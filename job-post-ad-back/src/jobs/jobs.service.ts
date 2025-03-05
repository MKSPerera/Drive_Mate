import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { AcceptJobDto } from './dto/accept-job.dto';
import { JobState, AvailabilityStatus } from '@prisma/client';

@Injectable()
export class JobsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createJobDto: CreateJobDto) {
    const { startDate, endDate, pickupTime, ...rest } = createJobDto;
    
    return this.prisma.job.create({
      data: {
        ...rest,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        pickupTime: new Date(pickupTime),
        postType: createJobDto.postType || 'PUBLIC', // Default to PUBLIC if not specified
      },
      include: {
        assignedDriver: {
          select: {
            firstName: true,
            lastName: true,
            contactNumber: true,
            vehicleType: true,
            vehicleLicense: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.job.findMany({
      include: {
        assignedDriver: {
          select: {
            firstName: true,
            lastName: true,
            contactNumber: true,
            vehicleType: true,
            vehicleLicense: true,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const job = await this.prisma.job.findUnique({
      where: { jobId: id },
      include: {
        assignedDriver: {
          select: {
            firstName: true,
            lastName: true,
            contactNumber: true,
            vehicleType: true,
            vehicleLicense: true,
          },
        },
      },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }
    return job;
  }

  async update(id: number, updateJobDto: UpdateJobDto) {
    const { startDate, endDate, pickupTime, ...rest } = updateJobDto;
    
    const data: any = { ...rest };
    if (startDate) data.startDate = new Date(startDate);
    if (endDate) data.endDate = new Date(endDate);
    if (pickupTime) data.pickupTime = new Date(pickupTime);

    return this.prisma.job.update({
      where: { jobId: id },
      data,
      include: {
        assignedDriver: {
          select: {
            firstName: true,
            lastName: true,
            contactNumber: true,
            vehicleType: true,
            vehicleLicense: true,
          },
        },
      },
    });
  }

  async remove(id: number) {
    const job = await this.prisma.job.findUnique({ where: { jobId: id } });
    if (!job) {
      throw new NotFoundException('Job not found');
    }

    return this.prisma.job.delete({ where: { jobId: id } });
  }

  async acceptJob(acceptJobDto: AcceptJobDto) {
    const { jobId, driverId } = acceptJobDto;

    return this.prisma.$transaction(async (prisma) => {
      // Find the job and check if it's available
      const job = await prisma.job.findUnique({ where: { jobId } });

      if (!job) {
        throw new NotFoundException('Job not found');
      }

      if (job.currentState !== JobState.PENDING) {
        throw new BadRequestException('Job is not available for acceptance');
      }

      // Check if the driver has any conflicting jobs
      const overlappingJob = await prisma.job.findFirst({
        where: {
          assignedDriverId: driverId,
          currentState: { in: [JobState.ACCEPTED, JobState.ONGOING] },
          OR: [
            { startDate: { lte: job.endDate }, endDate: { gte: job.startDate } }, // Check overlap
          ],
        },
      });

      if (overlappingJob) {
        throw new BadRequestException('Driver is already assigned to another job at this time');
      }

      // Check if the driver has availability
      let availability = await prisma.availability.findFirst({
        where: {
          driverId,
          status: AvailabilityStatus.AVAILABLE,
          startDate: { lte: job.startDate },
          endDate: { gte: job.endDate },
        },
      });

      if (!availability) {
        console.warn(`Driver ${driverId} has no availability record, assuming they are available.`);
        // ✅ If no availability exists, create a new one
        availability = await prisma.availability.create({
          data: {
            driverId,
            startDate: job.startDate,
            endDate: job.endDate,
            status: AvailabilityStatus.BUSY,
            jobId: jobId,
          },
        });
      } else {
        // ✅ If availability exists, update it
        await prisma.availability.updateMany({
          where: {
            driverId,
            startDate: { lte: job.startDate },
            endDate: { gte: job.endDate },
          },
          data: {
            status: AvailabilityStatus.BUSY,
            jobId: jobId,
          },
        });
      }

      // Update job to assign the driver
      const updatedJob = await prisma.job.update({
        where: { jobId },
        data: {
          currentState: JobState.ACCEPTED,
          assignedDriverId: driverId,
        },
      });

      return { message: 'Job accepted successfully', job: updatedJob };
    });
  }
}
