import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  async getStats() {
    const totalDrivers = await this.dashboardService.getTotalDrivers();
    const jobsPostedThisMonth = await this.dashboardService.getJobsPostedThisMonth();
    const pendingJobs = await this.dashboardService.getPendingJobs();
    const monthlyRevenue = await this.dashboardService.getMonthlyRevenue();

    return {
      totalDrivers,
      jobsPostedThisMonth,
      pendingJobs,
      monthlyRevenue
    };
  }

  @Get('monthly-stats')
  async getMonthlyStats() {
    return this.dashboardService.getMonthlyStats();
  }
} 