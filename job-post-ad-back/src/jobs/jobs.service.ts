import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { AcceptJobDto } from './dto/accept-job.dto';
import { JobState } from '@prisma/client';

@Injectable()
export class JobsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createJobDto: CreateJobDto) {
    const { startDate, endDate, pickupTime, ...rest } = createJobDto;
    
    // Convert string dates to Date objects
    const startDateTime = new Date(startDate);
    const endDateTime = new Date(endDate);
    const pickupDateTime = new Date(pickupTime);

    return this.prisma.job.create({
      data: {
        ...rest,
        startDate: startDateTime,
        endDate: endDateTime,
        pickupTime: pickupDateTime,
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
    return this.prisma.job.findUnique({
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
  }

  async update(id: number, updateJobDto: UpdateJobDto) {
    const { startDate, endDate, pickupTime, ...rest } = updateJobDto;
    
    // Convert string dates to Date objects if they exist
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
    return this.prisma.job.delete({ where: { jobId: id } });
  }

  async acceptJob(acceptJobDto: AcceptJobDto) {
    const { jobId, driverId } = acceptJobDto;

    // Check if the job exists and is pending
    const job = await this.prisma.job.findUnique({
      where: { jobId },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (job.currentState !== JobState.PENDING) {
      throw new BadRequestException('Job is not available for acceptance');
    }

    // Update the job status to ACCEPTED
    const updatedJob = await this.prisma.job.update({
      where: { jobId },
      data: {
        currentState: JobState.ACCEPTED,
        assignedDriverId: driverId,
      },
    });

    return { message: 'Job accepted successfully', job: updatedJob };
  }
}
