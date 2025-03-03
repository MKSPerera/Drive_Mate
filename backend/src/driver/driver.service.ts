import { Injectable, NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateDriverDto } from './dto/create-driver.dto';

// Import the JwtPayload interface to ensure type consistency
interface JwtPayload {
  driverId: number;
  contactNumber: string;
}

@Injectable()
export class DriverService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService
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
    console.log('=== Driver Login Attempt ===');
    console.log('Login attempt for contact number:', data.contactNumber);

    try {
      // Find driver with explicit field selection
      const driver = await this.prisma.driver.findUnique({ 
        where: { contactNumber: data.contactNumber },
        select: {
          id: true,
          password: true,
          contactNumber: true,
          firstName: true,
          lastName: true,
          email: true,
          vehicleType: true,
          vehicleCapacity: true,
          vehicleLicense: true,
        }
      });

      console.log('Found driver:', {
        ...driver,
        password: driver?.password ? '[HIDDEN]' : undefined
      });

      // Check if driver exists
      if (!driver) {
        console.error('Driver not found for contact number:', data.contactNumber);
        throw new UnauthorizedException('Invalid contactNumber or password');
      }

      // Verify required fields
      if (!driver.id || !driver.contactNumber) {
        console.error('Missing required fields:', {
          hasId: !!driver.id,
          hasContactNumber: !!driver.contactNumber
        });
        throw new BadRequestException('Driver record is missing required fields');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(data.password, driver.password);
      if (!isPasswordValid) {
        console.error('Invalid password for driver:', driver.id);
        throw new UnauthorizedException('Invalid contactNumber or password');
      }

      // Create strongly-typed payload
      const payload: JwtPayload = {
        driverId: driver.id,
        contactNumber: driver.contactNumber
      };

      console.log('Creating token with payload:', payload);

      // Generate token
      const token = await this.jwtService.signAsync(payload);

      console.log('Token created successfully');
      console.log('Token payload verification:', this.jwtService.decode(token));

      // Return token and driver information
      return { 
        token,
        driver: {
          driverId: driver.id,
          contactNumber: driver.contactNumber,
          firstName: driver.firstName,
          lastName: driver.lastName,
          email: driver.email,
          vehicleType: driver.vehicleType,
          vehicleCapacity: driver.vehicleCapacity,
          vehicleLicense: driver.vehicleLicense
        }
      };
    } catch (error) {
      console.error('Login error:', {
        message: error.message,
        stack: error.stack,
        type: error.constructor.name
      });

      if (error instanceof UnauthorizedException || 
          error instanceof BadRequestException) {
        throw error;
      }

      throw new UnauthorizedException('Authentication failed');
    }
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

  async findDriverById(id: number) {
    const driver = await this.prisma.driver.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        contactNumber: true,
        vehicleType: true,
        vehicleCapacity: true,
        vehicleLicense: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!driver) {
      throw new NotFoundException(`Driver with ID ${id} not found`);
    }

    return driver;
  }
} 