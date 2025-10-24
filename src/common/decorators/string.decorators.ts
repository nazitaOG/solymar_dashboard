// src/common/decorators/string.transformers.ts
import { BadRequestException } from '@nestjs/common';
import { Transform, type TransformFnParams } from 'class-transformer';
import {
  trimValue,
  upperTrimValue,
  lowerTrimValue,
} from '../utils/string-normalizer';

type Normalizer = (v: unknown) => unknown;

function makeStringTransform(normalizer: Normalizer): PropertyDecorator {
  return Transform(
    ({ value, key }: TransformFnParams) => {
      if (
        value === null ||
        value === undefined ||
        (typeof value === 'string' && value.trim() === '')
      ) {
        return undefined;
      }

      if (Array.isArray(value)) {
        throw new BadRequestException(
          `${key ?? 'campo'} debe ser un único valor, no un array`,
        );
      }

      return normalizer(value);
    },
    { toClassOnly: true },
  );
}

export const ToTrim = () => makeStringTransform(trimValue);
export const ToUpperTrim = () => makeStringTransform(upperTrimValue);
export const ToLowerTrim = () => makeStringTransform(lowerTrimValue);
