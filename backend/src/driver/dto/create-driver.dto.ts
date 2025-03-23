import { IsEmail, IsInt, isInt, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateDriverDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  contactNumber: string;

  @IsNotEmpty()
  @IsString()
  vehicleType: string;

  @IsNotEmpty()
  @IsInt()
  vehicleCapacity: number; // Number of passengers the vehicle can accommodate

  @IsNotEmpty()
  @IsString()
  vehicleLicense: string; // License plate number or unique vehicle identifier

  fcmToken?: string;
} 