import { Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt'; // 👈 1. Importa esto
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class GetJwtUtils {
  constructor(private readonly jwtService: JwtService) {}

  async generateAccessToken(payload: JwtPayload, expiresIn = '2h') {
    return this.jwtService.signAsync(payload, {
      // 👇 2. Casteo Type-Safe: "Trata este string como el tipo exacto que la librería espera"
      expiresIn: expiresIn as JwtSignOptions['expiresIn'],
    });
  }
}
