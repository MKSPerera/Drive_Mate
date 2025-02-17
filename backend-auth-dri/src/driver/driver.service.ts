import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { CreateDriverDto } from './dto/create-driver.dto';

@Injectable()
export class DriverService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService
  ) {}

  async create(createDriverDto: CreateDriverDto) {
    const hashedPassword = await bcrypt.hash(createDriverDto.password, 10);
    return this.prisma.driver.create({
      data: {
        firstName: createDriverDto.firstName,
        lastName: createDriverDto.lastName,
        email: createDriverDto.email,
        password: hashedPassword,
        contactNumber: createDriverDto.contactNumber,
        vehicleType: createDriverDto.vehicleType,
        vehicleCapacity: createDriverDto.vehicleCapacity,
        vehicleLicense: createDriverDto.vehicleLicense
        
        
      },
    });
  }

  async login(data: { contactNumber: string; password: string }) {
    const driver = await this.prisma.driver.findUnique({ where: { contactNumber: data.contactNumber } });
    if (!driver || !(await bcrypt.compare(data.password, driver.password))) {
      throw new UnauthorizedException('Invalid contactNumber or password');
    }

    const token = jwt.sign(
      { driverId: driver.id, contactNumber: driver.contactNumber },
      this.configService.get<string>('JWT_SECRET'),
      { expiresIn: this.configService.get<string>('JWT_EXPIRATION') }
    );

    return { token };
  }

  getDrivers() {
    return this.prisma.driver.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        contactNumber:true,
        vehicleType: true, // Include additional fields
        vehicleCapacity: true,
        vehicleLicense: true,
      },
    });
  }

  async updateDriver(id: number, data: { firstName?: string; lastName?: string; email?: string; contactNumber?: string; }) {
    return this.prisma.driver.update({
      where: { id },
      data,
    });
  }

  async deleteDriver(id: number) {
    try {
      return await this.prisma.driver.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`Driver with ID ${id} not found`);
    }
  }
} 