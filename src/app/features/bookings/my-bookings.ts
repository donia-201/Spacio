import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { BookingService } from '../../core/Services/booking.service';
import { AuthService } from '../../core/Services/auth.service';
import { Booking, BookingStatus } from '../../core/models/models';
import { StatusPipe } from '../../shared/pipes/status-pipe';

type Tab = 'all' | BookingStatus;

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, StatusPipe],
  template: `
    <div class="min-h-screen bg-slate-50">
      <header class="border-b border-slate-200 bg-white">
        <div class="container-page py-7">
          <h1 class="text-2xl font-extrabold text-ink">حجوزاتي</h1>
          <p class="mt-1.5 text-sm text-ink-soft">
            كل الحجوزات اللي عملتها، مع حالة كل واحد.
          </p>
        </div>
      </header>

      <div class="container-page py-8">
        <!-- Tabs -->
        <div class="flex flex-wrap gap-2">
          @for (tab of tabs; track tab.key) {
            <button
              type="button"
              (click)="setTab(tab.key)"
              class="rounded-xl border px-4 py-2 text-xs font-bold transition-colors"
              [class.border-brand-600]="activeTab() === tab.key"
              [class.bg-brand-600]="activeTab() === tab.key"
              [class.text-white]="activeTab() === tab.key"
              [class.border-slate-200]="activeTab() !== tab.key"
              [class.bg-white]="activeTab() !== tab.key"
              [class.text-ink-soft]="activeTab() !== tab.key"
            >
              {{ tab.label }}
            </button>
          }
        </div>

        @if (loading()) {
          <div class="mt-6 space-y-3">
            @for (i of [1, 2, 3]; track i) {
              <div class="h-32 animate-pulse rounded-[16px] border border-slate-200 bg-white"></div>
            }
          </div>
        } @else {
          <div class="mt-6 space-y-3">
            @for (booking of bookings(); track booking._id) {
              <div class="card-soft p-5">
                <div class="flex flex-wrap items-start justify-between gap-3">
                  <div class="min-w-0">
                    <div class="flex flex-wrap items-center gap-2">
                      <h3 class="text-sm font-bold text-ink">
                        {{ booking.resource.name }}
                      </h3>
                      <span
                        class="rounded-full px-2.5 py-0.5 text-[11px] font-bold"
                        [class]="statusClasses(booking.status)"
                      >
                        {{ booking.status | status }}
                      </span>
                    </div>
                    <p class="mt-1 text-xs text-ink-soft">
                      {{ booking.organization.name }}
                      @if (booking.resource.typeLabel) {
                        <span>• {{ booking.resource.typeLabel }}</span>
                      }
                    </p>
                  </div>

                  <a
                    [routerLink]="['/organizations', booking.organization._id]"
                    class="shrink-0 text-xs font-bold text-brand-700 hover:underline"
                  >
                    افتح المكان
                  </a>
                </div>

                <div
                  class="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-slate-100 pt-4 text-xs text-ink-soft"
                >
                  <span class="flex items-center gap-1.5 tabular">
                    <span>🕐</span>
                    {{ booking.startTime | date: 'd MMMM، HH:mm' }}
                  </span>
                  <span class="flex items-center gap-1.5 tabular">
                    <span>⏱</span>
                    {{ booking.endTime | date: 'HH:mm' }}
                  </span>
                  @if (booking.decisionNote) {
                    <span class="flex items-center gap-1.5 text-ink-muted">
                      <span>💬</span>
                      {{ booking.decisionNote }}
                    </span>
                  }
                </div>

                @if (booking.notes) {
                  <p class="mt-3 rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-ink-soft">
                    {{ booking.notes }}
                  </p>
                }

                <!-- Cancel: only while it's still actionable -->
                @if (booking.status === 'pending' || booking.status === 'approved') {
                  <div class="mt-4">
                    @if (cancellingId() === booking._id) {
                      <div class="space-y-2.5">
                        <input
                          type="text"
                          [ngModel]="cancelNote()"
                          (ngModelChange)="cancelNote.set($event)"
                          placeholder="سبب الإلغاء (اختياري)"
                          class="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs outline-none focus:border-brand-500"
                        />
                        <div class="flex gap-2">
                          <button
                            type="button"
                            (click)="confirmCancel(booking)"
                            [disabled]="busy()"
                            class="btn-accent flex-1 !bg-red-600 !py-2 text-xs hover:!bg-red-700"
                          >
                            {{ busy() ? 'جاري الإلغاء...' : 'تأكيد الإلغاء' }}
                          </button>
                          <button
                            type="button"
                            (click)="cancellingId.set(null)"
                            class="btn-ghost-dark flex-1 !py-2 text-xs"
                          >
                            رجوع
                          </button>
                        </div>
                      </div>
                    } @else {
                      <button
                        type="button"
                        (click)="startCancel(booking)"
                        class="text-xs font-bold text-red-600 hover:underline"
                      >
                        إلغاء الحجز
                      </button>
                    }
                  </div>
                }
              </div>
            } @empty {
              <div class="card-soft px-6 py-16 text-center">
                <p class="text-4xl">📭</p>
                <p class="mt-4 text-sm font-bold text-ink">مفيش حجوزات هنا</p>
                <p class="mt-1.5 text-xs text-ink-muted">
                  لما تحجز مكان، هيظهر هنا مع حالته.
                </p>
                <a routerLink="/home" class="btn-accent mt-6">ابدأ الاستكشاف</a>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class MyBookings implements OnInit {
  private bookingService = inject(BookingService);
  public auth = inject(AuthService);

  readonly tabs: Array<{ key: Tab; label: string }> = [
    { key: 'all', label: 'الكل' },
    { key: 'pending', label: 'بانتظار الموافقة' },
    { key: 'approved', label: 'مؤكد' },
    { key: 'completed', label: 'مكتمل' },
    { key: 'cancelled', label: 'ملغي' },
  ];

  readonly bookings = signal<Booking[]>([]);
  readonly activeTab = signal<Tab>('all');
  readonly loading = signal(true);
  readonly busy = signal(false);
  readonly cancellingId = signal<string | null>(null);
  readonly cancelNote = signal('');

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    const status = this.activeTab();
    this.loading.set(true);

    this.bookingService
      .mine({ limit: 50, ...(status === 'all' ? {} : { status }) })
      .subscribe({
        next: (res) => this.bookings.set(res.data ?? []),
        error: () => this.bookings.set([]),
        complete: () => this.loading.set(false),
      });
  }

  setTab(tab: Tab): void {
    this.activeTab.set(tab);
    this.load();
  }

  startCancel(booking: Booking): void {
    this.cancellingId.set(booking._id);
    this.cancelNote.set('');
  }

  confirmCancel(booking: Booking): void {
    this.busy.set(true);

    this.bookingService
      .cancel(booking._id, this.cancelNote().trim() || undefined)
      .pipe(finalize(() => this.busy.set(false)))
      .subscribe({
        next: () => {
          this.cancellingId.set(null);
          this.bookings.update((list) =>
            list.map((b) => (b._id === booking._id ? { ...b, status: 'cancelled' as const } : b)),
          );
        },
        error: () => {
          this.cancellingId.set(null);
        },
      });
  }

  statusClasses(status: string): string {
    const map: Record<string, string> = {
      approved: 'bg-brand-50 text-brand-700',
      completed: 'bg-slate-100 text-slate-600',
      pending: 'bg-amber-50 text-amber-700',
      rejected: 'bg-red-50 text-red-700',
      cancelled: 'bg-slate-100 text-slate-500',
    };
    return map[status] ?? 'bg-slate-100 text-slate-600';
  }
}
