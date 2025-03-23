import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { DriverAuthGuard } from '../driver/guards/driver-auth.guard';
import { AcceptJobDto } from './dto/accept-job.dto';
import { CreateJobDto } from './dto/create-job.dto';
import { PrivateJobAccessDto } from './dto/private-job-access.dto';
import { RejectJobDto } from './dto/reject-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JobsService } from './jobs.service';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  // Generic routes for all jobs
  @Get()
  findAll() {
    return this.jobsService.findAll();
  }

  @Post()
  create(@Body() createJobDto: CreateJobDto) {
    return this.jobsService.create(createJobDto);
  }

  // Specific routes first
  @Get('my-jobs') // Moved before the parameterized route
  @UseGuards(DriverAuthGuard)
  async getMyJobs(@Req() req) {
    console.log('Getting jobs for driver:', req.user.driverId); // Debug log
    const driverId = req.user.driverId;
    return this.jobsService.findJobsByDriver(driverId);
  }

  //accept job
  @Post('accept')
  @UseGuards(DriverAuthGuard)
  @HttpCode(HttpStatus.OK)
  async acceptJob(@Body() acceptJobDto: AcceptJobDto, @Req() req) {
    try {
      const result = await this.jobsService.acceptJob(acceptJobDto, req.user.driverId);
      return {
        status: 'success',
        message: 'Job accepted successfully',
        data: result,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  //reject job
  @Post('reject')
  @UseGuards(DriverAuthGuard)
  @HttpCode(HttpStatus.OK)
  async rejectJob(@Body() rejectJobDto: RejectJobDto, @Req() req) {
    try {
      const driverId = req.user.driverId;
      const jobData = {
        jobId: rejectJobDto.jobId,
        driverId,
        rejectionReason: rejectJobDto.rejectionReason
      };
      const result = await this.jobsService.rejectJob(jobData);
      return {
        status: 'success',
        message: 'Job rejected successfully',
        data: result,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  // Parameterized routes last
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(+id);
  }

  //update job
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateJobDto: UpdateJobDto) {
    return this.jobsService.update(+id, updateJobDto);
  }

  //delete job
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.jobsService.remove(+id);
  }

//add drivers to private job
  @Post('private-access')
  async addDriversToPrivateJob(@Body() privateJobAccessDto: PrivateJobAccessDto) {
    try {
      const result = await this.jobsService.addDriversToPrivateJob(
        privateJobAccessDto.jobId,
        privateJobAccessDto.driverIds
      );
      return {
        status: 'success',
        ...result
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }
//find available jobs for driver
  @Get('available')
  @UseGuards(DriverAuthGuard)
  async getAvailableJobs(@Req() req) {
    const driverId = req.user.driverId;
    return this.jobsService.findAvailableJobsForDriver(driverId);
  }
}
