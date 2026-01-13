import { BadRequestException } from '@nestjs/common';

export interface Segment {
  departure: string;
  arrival: string;
  departureDate: Date;
  arrivalDate: Date;
  segmentOrder: number;
}

export class PlaneSegmentPolicies {
  //
  // 1) Validación individual
  //
  static assertValidSegment(seg: Segment, index?: number) {
    if (!(seg.departure && seg.arrival)) {
      throw new BadRequestException(
        `El segmento #${index ?? '?'} requiere departure y arrival.`,
      );
    }

    // 🆕 Validación: Origen y destino iguales
    if (seg.departure === seg.arrival) {
      throw new BadRequestException(
        `El segmento #${index ?? '?'} no puede tener el mismo origen y destino (${seg.departure}).`,
      );
    }

    if (!(seg.departureDate instanceof Date)) {
      throw new BadRequestException(
        `El segmento #${index ?? '?'} tiene departureDate inválido.`,
      );
    }

    if (!(seg.arrivalDate instanceof Date)) {
      throw new BadRequestException(
        `El segmento #${index ?? '?'} tiene arrivalDate inválido.`,
      );
    }

    if (seg.arrivalDate.getTime() < seg.departureDate.getTime()) {
      throw new BadRequestException(
        `El segmento #${index ?? '?'} llega antes de salir.`,
      );
    }
  }

  //
  // 2) Validar orden lógico de segmentOrder
  //
  static assertSegmentOrder(segments: Segment[]) {
    const orders = segments.map((s) => s.segmentOrder);

    // Check uniqueness
    const dup = orders.find((o, idx) => orders.indexOf(o) !== idx);
    if (dup !== undefined) {
      throw new BadRequestException(`segmentOrder duplicado: ${dup}`);
    }

    // Must be 1..N
    const sorted = [...orders].sort((a, b) => a - b);
    sorted.forEach((o, idx) => {
      if (o !== idx + 1) {
        throw new BadRequestException(
          `segmentOrder debe ser 1..N sin huecos. Encontrado ${o}`,
        );
      }
    });
  }

  //
  // 3) Validar que los vuelos no se solapen
  //
  static assertNoOverlap(segments: Segment[]) {
    const sorted = [...segments].sort(
      (a, b) => a.departureDate.getTime() - b.departureDate.getTime(),
    );

    for (let i = 0; i < sorted.length - 1; i++) {
      const a = sorted[i];
      const b = sorted[i + 1];

      if (a.arrivalDate > b.departureDate) {
        throw new BadRequestException(
          `Los segmentos se superponen entre (#${a.segmentOrder}) y (#${b.segmentOrder}).`,
        );
      }
    }
  }

  //
  // 5) VALIDACIÓN COMPLETA
  //
  static assertValidSegments(segments: Segment[]) {
    if (!segments.length) {
      throw new BadRequestException(`El vuelo debe tener al menos 1 tramo.`);
    }

    // Individual
    segments.forEach((seg, i) => this.assertValidSegment(seg, i + 1));

    // Orden numérico
    this.assertSegmentOrder(segments);

    // Fechas sin superposiciones
    this.assertNoOverlap(segments);
  }
}
