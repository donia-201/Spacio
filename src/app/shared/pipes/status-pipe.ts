import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'status',
  standalone: true
})
export class StatusPipe implements PipeTransform {
  
  transform(value: string): string {
    if (value === 'available') {
      return 'Available';
    }

    if (value === 'booked') {
      return 'Booked';
    }

    if (value === 'maintenance') {
      return 'Maintenance';
    }

    return value; 
  }
}