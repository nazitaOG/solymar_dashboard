import { TransformFnParams } from 'class-transformer';

export const toTrim = ({ value }: TransformFnParams): unknown => {
  return typeof value === 'string' ? value.trim() : value;
};

export const toUpperTrim = ({ value }: TransformFnParams): unknown => {
  return typeof value === 'string' ? value.trim().toUpperCase() : value;
};
