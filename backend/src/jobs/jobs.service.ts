import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AvailabilityStatus, JobState } from '@prisma/client';
import { DriverRankingService } from '../driver-ranking/driver-ranking.service';
import { PrismaService } from '../prisma/prisma.service';
import { AcceptJobDto } from './dto/accept-job.dto';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JobNotificationService } from './job-notification.service';

@Injectable()
export class JobsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jobNotificationService: JobNotificationService,
    private readonly driverRankingService: DriverRankingService,
  ) {
    // Log available enum values when service is initialized
    console.log('Available AvailabilityStatus values:', Object.values(AvailabilityStatus));
  }

  async create(createJobDto: CreateJobDto) {
    const { startDate, endDate, pickupTime, ...rest } = createJobDto;
    
    const newJob = await this.prisma.job.create({
      data: {
        ...rest,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        pickupTime: new Date(pickupTime),
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

    // For public jobs, send notifications to all drivers
    if (newJob.postType === 'PUBLIC') {
      await this.jobNotificationService.sendJobCreatedNotification(newJob.jobId);
    }

    return newJob;
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
      where: {
        jobId: id
      },
      include: {
        assignedDriver: {
          select: {
            firstName: true,
            lastName: true,
            contactNumber: true,
            vehicleType: true,
            vehicleLicense: true
          }
        }
      }
    });
    
    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }
    
    return job;
  }

  async update(id: number, updateJobDto: UpdateJobDto) {
    const { startDate, endDate, pickupTime, ...rest } = updateJobDto;
    
    const data: any = { ...rest };
    if (startDate) data.startDate = new Date(startDate);
    if (endDate) data.endDate = new Date(endDate);
    if (pickupTime) data.pickupTime = new Date(pickupTime);
    
    // Get the current job to check if status is being updated
    let shouldNotify = false;
    if (updateJobDto.currentState) {
      const currentJob = await this.prisma.job.findUnique({
        where: { jobId: id }
      });
      if (currentJob && currentJob.currentState !== updateJobDto.currentState) {
        shouldNotify = true;
      }
    }

    const updatedJob = await this.prisma.job.update({
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

    // Send notification if status was updated
    if (shouldNotify && updatedJob.assignedDriverId) {
      await this.jobNotificationService.sendJobStatusUpdatedNotification(id);
    }

    return updatedJob;
  }

  async remove(id: number) {
    const job = await this.prisma.job.findUnique({ where: { jobId: id } });
    if (!job) {
      throw new NotFoundException('Job not found');
    }

    return this.prisma.job.delete({ where: { jobId: id } });
  }

  async acceptJob(acceptJobDto: AcceptJobDto, driverId: number) {
    const { jobId } = acceptJobDto;

    return this.prisma.$transaction(
      async (prisma) => {
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
              { startDate: { lte: job.endDate }, endDate: { gte: job.startDate } },
            ],
          },
        });

        if (overlappingJob) {
          throw new BadRequestException('Driver is already assigned to another job at this time');
        }

        // Check if the driver has any conflicting availability
        const overlappingAvailability = await prisma.availability.findFirst({
          where: {
            driverId,
            OR: [
              { startDate: { lte: job.endDate }, endDate: { gte: job.startDate } },
            ],
          },
        });

        if (overlappingAvailability) {
          throw new BadRequestException('Driver is already busy during this time period');
        }

        try {
          // Create a new availability record with JOB status
          await prisma.availability.create({
            data: {
              driverId,
              startDate: job.startDate,
              endDate: job.endDate,
              status: AvailabilityStatus.JOB,
              jobId: jobId,
            },
          });
        } catch (error) {
          console.error('Error creating availability:', error);
          throw new BadRequestException(`Failed to create availability: ${error.message}`);
        }

        // Update job to assign the driver
        const updatedJob = await prisma.job.update({
          where: { jobId },
          data: {
            currentState: JobState.ACCEPTED,
            assignedDriverId: driverId,
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

        // Send notification to admins about job acceptance
        await this.jobNotificationService.sendJobAcceptedNotification(jobId, driverId);

        return { message: 'Job accepted successfully', job: updatedJob };
      },
      {
        timeout: 30000 // Increased timeout to 30 seconds
      }
    );
  }

  async findJobsByDriver(driverId: number) {
    return this.prisma.job.findMany({
      where: {
        assignedDriverId: driverId,
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

  async rejectJob(data: { jobId: number; driverId: number; rejectionReason?: string }) {
    const { jobId, driverId, rejectionReason } = data;

    return this.prisma.$transaction(
      async (prisma) => {
        // Find the job and check if it exists and is assigned to this driver
        const job = await prisma.job.findUnique({
          where: { jobId },
          include: { assignedDriver: true }
        });

        if (!job) {
          throw new NotFoundException('Job not found');
        }

        if (job.assignedDriverId !== driverId) {
          throw new BadRequestException('You are not assigned to this job');
        }

        if (job.currentState !== JobState.ACCEPTED) {
          throw new BadRequestException('Only accepted jobs can be rejected');
        }

        // Delete the availability record associated with this job
        await prisma.availability.deleteMany({
          where: {
            driverId,
            jobId
          }
        });

        // Update job to remove driver assignment and set state back to PENDING
        const updatedJob = await prisma.job.update({
          where: { jobId },
          data: {
            currentState: JobState.PENDING,
            assignedDriverId: null,
            additionalDetails: rejectionReason 
              ? `Previous driver rejected: ${rejectionReason}`
              : 'Previous driver rejected the job'
          }
        });

        // Update the driver's cancellation rate using the Python script
      try {
        // Use processJobCancellation instead of updateDriverCancellation
        // This will use the Python script to calculate the new average rate
        await this.driverRankingService.processJobCancellation(driverId);
        
        console.log(`Driver ${driverId} cancellation processed with Python algorithm for job ${jobId}`);
      } catch (error) {
        console.error('Failed to update driver cancellation rate:', error);
        // Continue with the job rejection even if updating the cancellation rate fails
      }

        // Send cancellation notification to admins
        await this.jobNotificationService.sendJobCancelledNotification(jobId, driverId, rejectionReason);

        return { message: 'Job rejected successfully', job: updatedJob };
      },
      {
        timeout: 30000 // Increased timeout to 30 seconds
      }
    );
  }

  async addDriversToPrivateJob(jobId: number, driverIds: number[]) {
    // First check if the job exists and is private
    const job = await this.prisma.job.findUnique({
      where: { jobId }
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${jobId} not found`);
    }

    if (job.postType !== 'PRIVATE') {
      throw new BadRequestException('Only private jobs can have specific driver access');
    }

    // Create the driver access entries
    const createdEntries = await Promise.all(
      driverIds.map(async (driverId) => {
        try {
          return await this.prisma.jobDriverAccess.create({
            data: {
              jobId,
              driverId
            }
          });
        } catch (error) {
          // Handle unique constraint violations (driver already has access)
          if (error.code === 'P2002') {
            console.log(`Driver ${driverId} already has access to job ${jobId}`);
            return null;
          }
          throw error;
        }
      })
    );

    // Send notifications to the drivers that were successfully added
    const successfullyAddedDrivers = createdEntries.filter(entry => entry !== null);
    if (successfullyAddedDrivers.length > 0) {
      const addedDriverIds = successfullyAddedDrivers.map(entry => entry.driverId);
      await this.jobNotificationService.sendJobCreatedNotification(jobId, addedDriverIds);
    }

    return {
      message: 'Drivers added to private job successfully',
      addedDrivers: createdEntries.filter(entry => entry !== null).length
    };
  }

  async findAvailableJobsForDriver(driverId: number) {
    // Get all public jobs that are pending
    const publicJobs = await this.prisma.job.findMany({
      where: {
        postType: 'PUBLIC',
        currentState: JobState.PENDING
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

    // Get private jobs that the driver has access to
    const privateJobs = await this.prisma.job.findMany({
      where: {
        postType: 'PRIVATE',
        currentState: JobState.PENDING,
        jobDriverAccess: {
          some: {
            driverId
          }
        }
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

    // Combine and return both types of jobs
    return [...publicJobs, ...privateJobs];
  }
}
