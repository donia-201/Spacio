import { Pipe, PipeTransform } from '@angular/core';

/**
 * Metres to the nearest sensible unit. Egyptian users think in "متر" for
 * anything walkable and "كم" beyond that, so the switch happens at 1km.
 */
@Pipe({
  name: 'distance',
  standalone: true,
})
export class DistancePipe implements PipeTransform {
  transform(meters: number | null | undefined): string {
    if (meters === null || meters === undefined) return '';
    if (meters < 1000) return `${Math.round(meters)} متر`;
    return `${(meters / 1000).toFixed(1)} كم`;
  }
}
