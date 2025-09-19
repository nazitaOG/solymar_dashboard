// src/auth/guards/login-throttle.guard.ts
import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Request } from 'express';

type LoginBody = {
  email?: unknown;
};

@Injectable()
export class LoginThrottleGuard extends ThrottlerGuard {
  /**
   * Clave de rate limit = IP real + email del body (normalizado).
   * Firma esperada por ThrottlerGuard: (req) => Promise<string>
   */
  protected getTracker(req: Record<string, unknown>): Promise<string> {
    // casteo en dos pasos para evitar advertencias de TS
    const request = req as unknown as Request<
      Record<string, string>,
      unknown,
      LoginBody
    >;

    const ip = this.getRequestIp(request) ?? 'unknown-ip';

    const rawEmail = request.body?.email;
    const email =
      typeof rawEmail === 'string'
        ? rawEmail.trim().toLowerCase()
        : 'unknown-email';

    return Promise.resolve(`${ip}:${email}`);
  }

  /**
   * Obtiene IP considerando X-Forwarded-For si hay proxy/LB.
   * Recordá habilitar `app.set('trust proxy', 1)` si usás Express detrás de un proxy.
   */
  private getRequestIp(req: Request): string | undefined {
    const xffHeader = req.headers['x-forwarded-for'];
    const xff = Array.isArray(xffHeader) ? xffHeader[0] : xffHeader;

    if (typeof xff === 'string' && xff.length > 0) {
      const first = xff.split(',')[0]?.trim();
      if (first) return first;
    }
    return req.ip ?? req.socket?.remoteAddress ?? undefined;
  }
}
