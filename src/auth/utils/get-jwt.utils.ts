import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class GetJwtUtils {
  constructor(private readonly jwtService: JwtService) {}

  async generateAccessToken(payload: JwtPayload, expiresIn = '2h') {
    return this.jwtService.signAsync(payload, { expiresIn });
  }
}
