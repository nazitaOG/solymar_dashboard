import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendUserResetPassword(to: string, username: string, token: string) {
    // Obtenemos la URL base del frontend desde .env (ej: http://localhost:5173)
    const frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');

    // Armamos el link completo con el token
    const url = `${frontendUrl}/reset-password?token=${token}`;

    await this.mailerService.sendMail({
      to: to,
      subject: 'Recupera tu acceso - Sol y Mar Viajes',
      template: 'reset-password', // Nombre del archivo .hbs (sin extensión)
      context: {
        // Variables que se inyectan en el HTML ({{ name }}, {{ url }}, etc)
        name: username,
        url: url,
        year: new Date().getFullYear(),
      },
    });
  }
}
