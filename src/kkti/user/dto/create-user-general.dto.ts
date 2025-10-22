import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserGeneralDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @MinLength(8)
  confirmPassword: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsDateString()
  birth: string;

  @IsEnum(['MALE', 'FEMALE'])
  gender?: 'MALE' | 'FEMALE';

  @IsString()
  phoneNumber: string;

  @IsString()
  identityVerificationId: string;

  @IsString()
  provider: 'email';

  @IsOptional()
  success?: boolean;
}
