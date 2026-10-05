import { Pipe, PipeTransform } from '@angular/core';

/**
 * One place for every status label in the app. The backend enums are English
 * (`approved`, `maintenance`, ...) but the UI is Arabic, and the same enum
 * value shows up in three different screens, so the mapping is shared.
 */
@Pipe({
  name: 'status',
  standalone: true,
})
export class StatusPipe implements PipeTransform {
  private readonly labels: Record<string, string> = {
    // Resource
    available: 'متاح',
    booked: 'محجوز',
    maintenance: 'صيانة',

    // Booking
    pending: 'بانتظار الموافقة',
    approved: 'مؤكد',
    rejected: 'مرفوض',
    cancelled: 'ملغي',
    completed: 'مكتمل',

    // Membership
    resident: 'مقيم',
    employee: 'موظف',
    manager: 'مدير',
    building_admin: 'مسؤول مبنى',
    doctor: 'دكتور',
    teacher: 'مدرس',
    member: 'عضو',

    // Location permission
    granted: 'مفعّل',
    denied: 'مرفوض',
  };

  transform(value: string | null | undefined): string {
    if (!value) return '';
    return this.labels[value] ?? value;
  }
}
