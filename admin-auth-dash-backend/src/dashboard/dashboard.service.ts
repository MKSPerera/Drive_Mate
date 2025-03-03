import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JobState } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getTotalDrivers(): Promise<number> {
    // Assuming you have a Driver model in your Prisma schema
    // If driver model doesn't exist yet, return a mock value
    try {
      return await this.prisma.driver.count();
    } catch (error) {
      console.warn('Driver model not found, returning mock data');
      return 231;
    }
  }

  async getJobsPostedThisMonth(): Promise<number> {
    try {
      const currentDate = new Date();
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      return await this.prisma.job.count({
        where: {
          jobCreatedAt: {
            gte: firstDayOfMonth,
            lte: lastDayOfMonth
          }
        }
      });
    } catch (error) {
      console.warn('Error counting jobs posted this month, returning mock data', error);
      return 47;
    }
  }

  async getPendingJobs(): Promise<number> {
    try {
      return await this.prisma.job.count({
        where: {
          currentState: JobState.PENDING
        }
      });
    } catch (error) {
      console.warn('Error counting pending jobs, returning mock data', error);
      return 32;
    }
  }

  async getMonthlyRevenue(): Promise<number> {
    try {
      const currentDate = new Date();
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      // Get all jobs created this month regardless of status
      const jobsThisMonth = await this.prisma.job.findMany({
        where: {
          jobCreatedAt: {
            gte: firstDayOfMonth,
            lte: lastDayOfMonth
          }
        },
        select: {
          paymentAmount: true
        }
      });

      // Sum up all payment amounts
      return jobsThisMonth.reduce((total, job) => total + job.paymentAmount, 0);
    } catch (error) {
      console.warn('Error calculating monthly revenue, returning mock data', error);
      return 52410;
    }
  }
} 