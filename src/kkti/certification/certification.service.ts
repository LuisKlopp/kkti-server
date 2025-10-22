import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class CertificationService {
  private readonly PORTONE_API_URL =
    'https://api.portone.io/identity-verifications';

  constructor(private readonly configService: ConfigService) {}

  async verifyIdentity(identityVerificationId: string) {
    try {
      const apiSecret = this.configService.get<string>('PORTONE_API_SECRET');

      const response = await axios.get(
        `${this.PORTONE_API_URL}/${encodeURIComponent(identityVerificationId)}`,
        {
          headers: {
            Authorization: `PortOne ${apiSecret}`,
          },
        },
      );

      const data = response.data;

      if (!data || !data.id || !data.verifiedCustomer) {
        throw new HttpException('본인인증 검증 실패', HttpStatus.BAD_REQUEST);
      }

      const customer = data.verifiedCustomer;

      return {
        success: true,
        identityVerificationId: data.id,
        name: customer.name,
        birth: customer.birthDate,
        gender: customer.gender,
        phoneNumber: customer.phoneNumber,
      };
    } catch (error) {
      console.error('[PortOne Verification Error]');
      if (axios.isAxiosError(error)) {
        console.error('status:', error.response?.status);
        console.error('data:', error.response?.data);
      } else {
        console.error(error);
      }

      throw new HttpException(
        'PortOne 본인인증 요청 실패',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
