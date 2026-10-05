import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';

import { DashboardService } from '../../core/Services/dashboard.service';
import { ResourceService } from '../../core/Services/resource.service';
import { BookingService } from '../../core/Services/booking.service';
import { AuthService } from '../../core/Services/auth.service';
import {
  Booking,
  Resource,
  ResourceStatus,
  TechnicianDashboard,
} from '../../core/models/models';
import { StatusPipe } from '../../shared/pipes/status-pipe';

@Component({
  selector: 'app-technician-dashboard',
  standalone: true,
  imports: [CommonModule, StatusPipe],
  templateUrl: './technician-dashboard.html',
  styleUrl: './technician-dashboard.css',
})
export class TechnicianDashboardPage implements OnInit {
  private dashboardService = inject(DashboardService);
  private resourceService = inject(ResourceService);
  private bookingService = inject(BookingService);
  public auth = inject(AuthService);

  readonly data = signal<TechnicianDashboard | null>(null);
  readonly resources = signal<Resource[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly busyId = signal<string | null>(null);

  /** Which tab of resources is showing. */
  readonly tab = signal<'all' | ResourceStatus>('all');

  readonly visibleResources = signal<Resource[]>([]);

  /** The three states a resource can be flipped to. */
  readonly statuses: Array<{ key: ResourceStatus; label: string }> = [
    { key: 'available', label: 'متاح' },
    { key: 'booked', label: 'محجوز' },
    { key: 'maintenance', label: 'صيانة' },
  ];

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);

    this.dashboardService.technician().subscribe({
      next: (res) => {
        this.data.set(res.data ?? null);
        this.loadResources();
      },
      error: () => {
        this.error.set('مقدرناش نحمّل بيانات اللوحة.');
        this.loading.set(false);
      },
    });
  }

  private loadResources(): void {
    this.resourceService.manageable().subscribe({
      next: (res) => {
        this.resources.set(res.data ?? []);
        this.applyFilter();
        this.loading.set(false);
      },
      error: () => {
        this.resources.set([]);
        this.loading.set(false);
      },
    });
  }

  setTab(tab: 'all' | ResourceStatus): void {
    this.tab.set(tab);
    this.applyFilter();
  }

  private applyFilter(): void {
    const tab = this.tab();
    this.visibleResources.set(
      tab === 'all' ? this.resources() : this.resources().filter((r) => r.status === tab),
    );
  }

  countByStatus(status: ResourceStatus): number {
    return this.resources().filter((r) => r.status === status).length;
  }

  /** The technician's main lever: flip a resource's availability. */
  setStatus(resource: Resource, status: ResourceStatus): void {
    this.busyId.set(resource._id);

    this.resourceService
      .setStatus(resource._id, status)
      .pipe(finalize(() => this.busyId.set(null)))
      .subscribe({
        next: (res) => {
          const updated = res.data;
          this.resources.update((list) =>
            list.map((r) => (r._id === resource._id ? { ...r, ...(updated ?? {}) } : r)),
          );
          this.applyFilter();
        },
        error: () => this.loadResources(),
      });
  }

  // ---------------- Booking queue ----------------

  decide(booking: Booking, action: 'approve' | 'reject'): void {
    this.busyId.set(booking._id);

    const request$ =
      action === 'approve'
        ? this.bookingService.approve(booking._id)
        : this.bookingService.reject(booking._id);

    request$.pipe(finalize(() => this.busyId.set(null))).subscribe({
      next: (res) => {
        const updated = res.data;
        this.data.update((current) => {
          if (!current) return current;
          return {
            ...current,
            bookings: {
              ...current.bookings,
              queue: current.bookings.queue.map((b) =>
                b._id === booking._id ? { ...b, ...updated } : b,
              ),
              pending: Math.max(0, current.bookings.pending - 1),
              byStatus: {
                ...current.bookings.byStatus,
                [updated?.status ?? action]: (current.bookings.byStatus[updated?.status ?? action] ?? 0) + 1,
              },
            },
          };
        });
      },
      error: () => this.load(),
    });
  }

  complete(booking: Booking): void {
    this.busyId.set(booking._id);
    this.bookingService
      .complete(booking._id)
      .pipe(finalize(() => this.busyId.set(null)))
      .subscribe({
        next: () => this.load(),
        error: () => this.load(),
      });
  }
}
