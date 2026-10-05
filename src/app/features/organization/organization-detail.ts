import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import { OrganizationService } from '../../core/Services/organization.service';
import { LocationService } from '../../core/Services/location.service';
import { BookingService } from '../../core/Services/booking.service';
import { Organization, OptionDetail, Resource } from '../../core/models/models';
import { MapMarker, MapRoute, MapView } from '../../shared/components/map-view/map-view';

@Component({
  selector: 'app-organization-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MapView],
  templateUrl: './organization-detail.html',
  styleUrl: './organization-detail.css',
})
export class OrganizationDetail implements OnInit {
  private organizationService = inject(OrganizationService);
  private location = inject(LocationService);
  private bookingService = inject(BookingService);
  private route = inject(ActivatedRoute);

  readonly organization = signal<Organization | null>(null);
  readonly resources = signal<Resource[]>([]);
  readonly activeOption = signal<string>('');
  readonly loading = signal(true);
  readonly error = signal('');

  // Booking dialog
  readonly bookingResource = signal<Resource | null>(null);
  readonly startTime = signal('');
  readonly endTime = signal('');
  readonly notes = signal('');
  readonly bookingBusy = signal(false);
  readonly bookingError = signal('');
  readonly bookingDone = signal('');

  readonly mapMarkers = signal<MapMarker[]>([]);
  readonly mapRoute = signal<MapRoute | null>(null);

  /** Option chips drive the resource filter. */
  readonly visibleResources = computed(() => {
    const option = this.activeOption();
    if (!option) return this.resources();
    return this.resources().filter((r) => r.type === option);
  });

  get coords() {
    return this.location.coords();
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('رابط غير صحيح.');
      this.loading.set(false);
      return;
    }

    this.organizationService.byId(id).subscribe({
      next: (res) => {
        const org = res.data ?? null;
        this.organization.set(org);

        if (org) {
          this.mapMarkers.set([
            {
              id: org._id,
              lat: org.location.coordinates[1],
              lng: org.location.coordinates[0],
              label: org.name,
              emoji: org.typeLabel?.[0] ?? '📍',
              highlight: true,
            },
          ]);

          // Draw the line from the user, when we know where they are.
          const coords = this.location.coords();
          if (coords && org.location?.coordinates) {
            this.mapRoute.set({
              from: { lat: coords.latitude, lng: coords.longitude },
              to: { lat: org.location.coordinates[1], lng: org.location.coordinates[0] },
              distanceMeters: org.distanceMeters,
            });
          }
        }
        this.loading.set(false);
      },
      error: () => {
        this.error.set('مقدرناش نحمّل بيانات المكان.');
        this.loading.set(false);
      },
    });

    this.organizationService.resources(id, { limit: 100 }).subscribe({
      next: (res) => this.resources.set(res.data ?? []),
      error: () => this.resources.set([]),
    });
  }

  optionChips(): OptionDetail[] {
    return this.organization()?.options ?? [];
  }

  setOption(key: string): void {
    this.activeOption.set(this.activeOption() === key ? '' : key);
  }

  countFor(type: string): number {
    return this.resources().filter((r) => r.type === type).length;
  }

  // ---------------- Booking ----------------

  openBooking(resource: Resource): void {
    this.bookingResource.set(resource);
    this.bookingError.set('');
    this.bookingDone.set('');
    this.notes.set('');

    // Default to the next full hour, one hour long.
    const start = new Date();
    start.setMinutes(0, 0, 0);
    start.setHours(start.getHours() + 1);
    const end = new Date(start.getTime() + 60 * 60 * 1000);

    this.startTime.set(this.toLocalInput(start));
    this.endTime.set(this.toLocalInput(end));
  }

  closeBooking(): void {
    this.bookingResource.set(null);
  }

  confirmBooking(): void {
    const resource = this.bookingResource();
    const org = this.organization();
    if (!resource || !org) return;

    if (!this.startTime() || !this.endTime()) {
      this.bookingError.set('حدد وقت البداية والنهاية.');
      return;
    }

    if (new Date(this.endTime()) <= new Date(this.startTime())) {
      this.bookingError.set('وقت النهاية لازم يكون بعد وقت البداية.');
      return;
    }

    this.bookingBusy.set(true);
    this.bookingError.set('');

    this.bookingService
      .create({
        resource: resource._id,
        organization: org._id,
        // The inputs are local wall-clock; send them as UTC ISO strings.
        startTime: new Date(this.startTime()).toISOString(),
        endTime: new Date(this.endTime()).toISOString(),
        notes: this.notes().trim() || undefined,
      })
      .pipe(finalize(() => this.bookingBusy.set(false)))
      .subscribe({
        next: (res) => {
          this.bookingDone.set(
            res.data?.status === 'approved'
              ? 'تم تأكيد حجزك على طول ✅'
              : 'تم إرسال طلب الحجز، وهيتأكد من المكان قريباً.',
          );
          // Reflect the resource as booked straight away.
          this.resources.update((list) =>
            list.map((r) =>
              r._id === resource._id ? { ...r, status: 'booked' as const } : r,
            ),
          );
        },
        error: (err) => {
          this.bookingError.set(err?.error?.message ?? 'مقدرناش نكمّل الحجز. حاول تاني.');
        },
      });
  }

  /** `datetime-local` needs `YYYY-MM-DDTHH:mm` in local time, no zone. */
  private toLocalInput(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
      date.getHours(),
    )}:${pad(date.getMinutes())}`;
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      available: 'متاح',
      booked: 'محجوز',
      maintenance: 'صيانة',
    };
    return map[status] ?? status;
  }

  formatDistance(meters?: number | null): string {
    if (meters === null || meters === undefined) return '';
    if (meters < 1000) return `${Math.round(meters)} متر`;
    return `${(meters / 1000).toFixed(1)} كم`;
  }
}
