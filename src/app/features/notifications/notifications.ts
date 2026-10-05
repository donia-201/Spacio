import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { NotificationService } from '../../core/Services/notification.service';
import { AppNotification, NotificationType } from '../../core/models/models';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css',
})
export class Notifications implements OnInit {
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  readonly items = signal<AppNotification[]>([]);
  readonly loading = signal(true);
  readonly busy = signal(false);
  readonly filter = signal<'all' | 'unread'>('all');

  readonly visible = computed(() =>
    this.filter() === 'unread' ? this.items().filter((n) => !n.isRead) : this.items(),
  );

  readonly unreadCount = computed(() => this.items().filter((n) => !n.isRead).length);

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.notificationService.list({ limit: 60 }).subscribe({
      next: (res) => this.items.set(res.data ?? []),
      error: () => this.items.set([]),
      complete: () => this.loading.set(false),
    });
  }

  markAllRead(): void {
    this.busy.set(true);
    this.notificationService
      .markAllRead()
      .pipe(finalize(() => this.busy.set(false)))
      .subscribe({
        next: () =>
          this.items.update((list) =>
            list.map((n) => ({ ...n, isRead: true, readAt: n.readAt ?? new Date().toISOString() })),
          ),
      });
  }

  /**
   * Opening a notification marks it read, then follows the route the backend
   * attached, so a booking notification lands on the booking it refers to.
   */
  open(notification: AppNotification): void {
    if (!notification.isRead) {
      this.notificationService.markRead(notification._id).subscribe(() => {
        this.items.update((list) =>
          list.map((n) =>
            n._id === notification._id
              ? { ...n, isRead: true, readAt: new Date().toISOString() }
              : n,
          ),
        );
      });
    }

    const route = notification.data?.route;
    if (route) this.router.navigateByUrl(route);
  }

  remove(notification: AppNotification, event: Event): void {
    event.stopPropagation();
    this.notificationService.remove(notification._id).subscribe({
      next: () => this.items.update((list) => list.filter((n) => n._id !== notification._id)),
    });
  }

  iconFor(type: NotificationType): string {
    const map: Record<NotificationType, string> = {
      location_permission: '📍',
      welcome: '👋',
      membership_request: '📨',
      membership_approved: '✅',
      membership_rejected: '❌',
      booking_created: '📋',
      booking_approved: '✅',
      booking_rejected: '❌',
      booking_cancelled: '🚫',
      resource_assigned: '🛠',
      resource_status_changed: '🔧',
      system: '🔔',
    };
    return map[type] ?? '🔔';
  }

  toneFor(type: NotificationType): string {
    const success: NotificationType[] = [
      'membership_approved',
      'booking_approved',
      'welcome',
    ];
    const danger: NotificationType[] = ['membership_rejected', 'booking_rejected'];
    const warn: NotificationType[] = ['booking_created', 'membership_request'];

    if (success.includes(type)) return 'bg-brand-50 text-brand-700';
    if (danger.includes(type)) return 'bg-red-50 text-red-700';
    if (warn.includes(type)) return 'bg-amber-50 text-amber-700';
    return 'bg-slate-100 text-ink-soft';
  }
}
