import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, Query, ValidationPipe } from '@nestjs/common';
import { DriverRankingService } from './driver-ranking.service';
import { JobFeedbackDto } from './dto/job-feedback.dto';

@Controller('driver-ranking')
export class DriverRankingController {
  constructor(private readonly driverRankingService: DriverRankingService) {}

  @Get()
  getAllDriverRankings() {
    return this.driverRankingService.getAllDriverRankings();
  }

  @Get('top')
  getTopDrivers(@Query('limit', ParseIntPipe) limit?: number) {
    return this.driverRankingService.getTopDrivers(limit);
  }

  @Get(':driverId')
  getDriverRanking(@Param('driverId', ParseIntPipe) driverId: number) {
    return this.driverRankingService.getDriverRanking(driverId);
  }

  @Put(':driverId/update-ranking')
  updateDriverRanking(@Param('driverId', ParseIntPipe) driverId: number) {
    return this.driverRankingService.updateDriverRanking(driverId);
  }

  @Post('process-work-rates')
  processDriverWorkRates() {
    return this.driverRankingService.processDriverWorkRates();
  }

  @Post('job-feedback')
  submitJobFeedback(@Body(ValidationPipe) jobFeedbackDto: JobFeedbackDto) {
    return this.driverRankingService.processJobFeedback(jobFeedbackDto);
  }
}
