import { Body, Controller, Post } from '@nestjs/common';

import { CertificationService } from './certification.service';
import { VerifyCertificationDto } from './dto/verify-certification.dto';

@Controller('certification')
export class CertificationController {
  constructor(private readonly certificationService: CertificationService) {}

  @Post('verify')
  async verifyIdentity(@Body() dto: VerifyCertificationDto) {
    return this.certificationService.verifyIdentity(dto.identityVerificationId);
  }
}
