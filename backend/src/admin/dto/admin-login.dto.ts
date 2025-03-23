import { IsString, IsNotEmpty, IsEmail, ValidateIf } from 'class-validator';

export class AdminLoginDto {
  @ValidateIf(o => !o.email)
  @IsString()
  @IsNotEmpty()
  username?: string;

  @ValidateIf(o => !o.username)
  @IsEmail()
  @IsNotEmpty()
  email?: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
