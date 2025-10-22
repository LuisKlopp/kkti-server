import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyCertificationDto {
  @IsString()
  @IsNotEmpty()
  identityVerificationId: string;
}
