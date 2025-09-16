// src/hotels/dto/update-hotel.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateHotelDto } from './create-hotel.dto';
import { AtLeastOneField } from '../../common/validators/at-lest-one-field';

export class UpdateHotelDto extends PartialType(CreateHotelDto) {
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
    'reservationId',
  ])
  private _atLeastOne!: true;
}
