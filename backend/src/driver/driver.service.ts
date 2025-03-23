import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { DriverRankingService } from '../driver-ranking/driver-ranking.service';
import { FirebaseService } from '../notifications/firebase.service';
import { NotificationService } from '../notifications/notifications.service';

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
    private readonly jwtService: JwtService,
    private readonly driverRankingService: DriverRankingService,
    private readonly firebaseService: FirebaseService,
    private readonly notificationService: NotificationService

  ) {}

  async create(createDriverDto: CreateDriverDto) {
    const hashedPassword = await bcrypt.hash(createDriverDto.password, 10);
    
    // Create the driver
    const driver = await this.prisma.driver.create({
      data: {
        firstName: createDriverDto.firstName,
        lastName: createDriverDto.lastName,
        email: createDriverDto.email,
        password: hashedPassword,
        contactNumber: createDriverDto.contactNumber,
        vehicleType: createDriverDto.vehicleType,
        vehicleCapacity: createDriverDto.vehicleCapacity,
        vehicleLicense: createDriverDto.vehicleLicense,
        fcmToken: createDriverDto.fcmToken,
      },
    });

    // Initialize driver ranking
    await this.driverRankingService.initializeDriverRanking(driver.id);

    // Create payload for JWT
    const payload: JwtPayload = {
      driverId: driver.id,
      contactNumber: driver.contactNumber
    };

    // Generate token
    const token = await this.jwtService.signAsync(payload);

     // Send welcome notification to the driver
     if (driver.fcmToken) {
      await this.firebaseService.sendPushNotification(
        driver.fcmToken,
        'Welcome to DriveMate 🚗',
        `Hello ${driver.firstName}, your account has been created successfully!`
      );
    }

    // Send notification to admins about new driver registration
    await this.notificationService.createDriverSignupNotification(driver.id);

    // Return driver data (excluding password) and token
    return {
      token,
      driver: {
        id: driver.id,
        firstName: driver.firstName,
        lastName: driver.lastName,
        email: driver.email,
        contactNumber: driver.contactNumber,
        vehicleType: driver.vehicleType,
        vehicleCapacity: driver.vehicleCapacity,
        vehicleLicense: driver.vehicleLicense
      }
    };
  }

  async login(data: { contactNumber: string; password: string }) {
    console.log('=== Driver Login Attempt ===');
    console.log('Login attempt for contact number:', data.contactNumber);

    try {
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
          fcmToken: true,  // Include fcmToken for later notifications
        }
      });

      if (!driver) {
        throw new UnauthorizedException('Invalid contactNumber or password');
      }

      const isPasswordValid = await bcrypt.compare(data.password, driver.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid contactNumber or password');
      }

      const payload: JwtPayload = {
        driverId: driver.id,
        contactNumber: driver.contactNumber,
      };

      const token = await this.jwtService.signAsync(payload);

      // Send push notification if fcmToken exists
      if (driver.fcmToken) {
        await this.firebaseService.sendPushNotification(
          driver.fcmToken,
          'Login Successful 🎉',
          `Hello ${driver.firstName}, you have successfully logged in to DriveMate.`
        );
      }

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
          vehicleLicense: driver.vehicleLicense,
        }
      };
    } catch (error) {
      console.error('Login error:', error);
      throw new UnauthorizedException('Authentication failed');
    }
  }

  async getDrivers() {
    const drivers = await this.prisma.driver.findMany({
      include: {
        driverRanking: true
      }
    });

    // Sort drivers by average rating (highest first)
    return drivers.sort((a, b) => {
      const ratingA = a.driverRanking?.[0]?.averageRate || 0;
      const ratingB = b.driverRanking?.[0]?.averageRate || 0;
      return ratingB - ratingA;
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