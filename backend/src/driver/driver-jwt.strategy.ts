import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

// Define the token payload interface with readonly properties
interface JwtPayload {
  readonly driverId: number;
  readonly contactNumber: string;
}

// Define the return type for consistency
type ValidatedDriver = {
  driverId: number;
  contactNumber: string;
};

@Injectable()
export class DriverJwtStrategy extends PassportStrategy(Strategy, 'driver-jwt') {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any): Promise<ValidatedDriver> {
    // Detailed payload logging
    console.log('=== JWT Payload Debug ===');
    console.log('Full payload:', JSON.stringify(payload, null, 2));
    console.log('Payload type:', typeof payload);
    console.log('driverId:', {
      value: payload?.driverId,
      type: typeof payload?.driverId
    });
    console.log('contactNumber:', {
      value: payload?.contactNumber,
      type: typeof payload?.contactNumber
    });

    // Step-by-step payload validation
    if (!payload) {
      console.error('Payload is null or undefined');
      throw new UnauthorizedException('Token payload is missing');
    }

    if (!('driverId' in payload)) {
      console.error('driverId is missing from payload');
      throw new UnauthorizedException('Token missing driverId');
    }

    if (typeof payload.driverId !== 'number') {
      console.error(`driverId is wrong type: ${typeof payload.driverId}`);
      throw new UnauthorizedException('Invalid driverId type in token');
    }

    if (!('contactNumber' in payload)) {
      console.error('contactNumber is missing from payload');
      throw new UnauthorizedException('Token missing contactNumber');
    }

    if (typeof payload.contactNumber !== 'string') {
      console.error(`contactNumber is wrong type: ${typeof payload.contactNumber}`);
      throw new UnauthorizedException('Invalid contactNumber type in token');
    }

    try {
      // Find driver using validated driverId
      const driver = await this.prisma.driver.findUnique({
        where: { id: payload.driverId },
        select: {
          id: true,
          contactNumber: true,
        },
      });

      if (!driver) {
        console.error(`No driver found for ID: ${payload.driverId}`);
        throw new UnauthorizedException('Driver not found');
      }

      console.log('=== Found Driver ===');
      console.log('Driver data:', {
        id: driver.id,
        contactNumber: driver.contactNumber
      });

      // Validate that found driver matches payload
      if (driver.contactNumber !== payload.contactNumber) {
        console.error('Driver contactNumber mismatch');
        throw new UnauthorizedException('Token payload mismatch');
      }

      return {
        driverId: driver.id,
        contactNumber: driver.contactNumber
      };
    } catch (error) {
      console.error('Validation error:', {
        message: error.message,
        stack: error.stack
      });
      
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      
      throw new UnauthorizedException('Token validation failed');
    }
  }
} 