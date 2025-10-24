// common/decorators/date.transformers.ts
import { BadRequestException } from '@nestjs/common';
import { Transform, type TransformFnParams } from 'class-transformer';
import { toDateRaw, toDateDay, toDateMinute } from '../utils/date-transform';

type Parser = (v: unknown) => Date;

function makeDateTransform(parser: Parser): PropertyDecorator {
  return Transform(
    ({ value, key }: TransformFnParams) => {
      // Dejar que @IsOptional maneje la ausencia
      if (value === null || value === undefined || value === '') {
        return undefined;
      }

      // Rechazar arrays explícitamente
      if (Array.isArray(value)) {
        throw new BadRequestException(
          `${key ?? 'field'} must be a single value, not an array`,
        );
      }

      // Parsear valor escalar
      try {
        return parser(value);
      } catch {
        throw new BadRequestException(
          `${key ?? 'date'} must be a valid ISO date`,
        );
      }
    },
    { toClassOnly: true },
  );
}

export const ToDate = () => makeDateTransform(toDateRaw);
export const ToDateDay = () => makeDateTransform(toDateDay);
export const ToDateMinute = () => makeDateTransform(toDateMinute);
