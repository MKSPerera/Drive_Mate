import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { DriverService } from './driver.service';
import { CreateDriverDto } from './dto/create-driver.dto';

@Controller('drivers')
export class DriverController {
  constructor(private readonly driverService: DriverService) {}

  @Post()
  create(@Body() createDriverDto: CreateDriverDto) {
    return this.driverService.create(createDriverDto);
  }

  @Post('login')
  async login(
    @Body()
    body: {
      contactNumber: string;
      password: string;
    },
  ) {
    return this.driverService.login(body);
  }

  @Get()
  getDrivers() {
    return this.driverService.getDrivers();
  }

  @Patch(':id')
  async updateDriver(
    @Param('id') id: string,
    @Body() body: { firstName?: string; lastName?: string; email?: string; contactNumber?: string; },
  ) {
    return this.driverService.updateDriver(Number(id), body);
  }

  @Delete(':id')
  async deleteDriver(@Param('id') id: string) {
    return this.driverService.deleteDriver(Number(id));
  }
} 