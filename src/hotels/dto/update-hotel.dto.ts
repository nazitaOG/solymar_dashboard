// src/hotels/dto/update-hotel.dto.ts
import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateHotelDto } from './create-hotel.dto';
import { AtLeastOneField } from '../../common/validators/at-lest-one-field';

class CreateHotelDtoWithoutReservationId extends OmitType(CreateHotelDto, [
  'reservationId',
] as const) {}

export class UpdateHotelDto extends PartialType(
  CreateHotelDtoWithoutReservationId,
) {
  @AtLeastOneField([
    'startDate',
    'endDate',
    'city',
    'hotelName',
    'bookingReference',
    'totalPrice',
    'amountPaid',
    'roomType',
    'provider',
  ])
  private _atLeastOne!: true;
}
