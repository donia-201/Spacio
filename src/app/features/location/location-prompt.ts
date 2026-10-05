import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { LocationService, LocationStatus } from '../../core/Services/location.service';
import { AuthService } from '../../core/Services/auth.service';

/**
 * Asked after signup. The whole product is location-first, so this screen
 * explains the value before triggering the browser prompt, which browsers
 * tend to be stingy about on first ask.
 */
@Component({
  selector: 'app-location-prompt',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div class="w-full max-w-lg">
        <div class="card-soft overflow-hidden">
          <!-- Header -->
          <div
            class="relative isolate overflow-hidden bg-brand-800 px-7 py-9 text-center text-white"
          >
            <div
              class="absolute inset-0 -z-10 opacity-20"
              style="
                background-image: radial-gradient(circle at 1px 1px, rgba(255,255,255,.45) 1px, transparent 0);
                background-size: 22px 22px;
              "
              aria-hidden="true"
            ></div>

            <span
              class="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-white/15 text-3xl backdrop-blur-sm"
            >
              📍
            </span>
            <h1 class="mt-5 text-2xl font-extrabold">نتعرف مكانك الأول</h1>
            <p class="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-brand-50">
              عن طريق موقعك بنرتّب لك الأماكن القريبة منك، ودي أهم حاجة بتخلي
              Spacio مفيد ليك.
            </p>
          </div>

          <!-- Body -->
          <div class="p-7">
            <ul class="space-y-4">
              @for (point of benefits; track point.title) {
                <li class="flex items-start gap-3">
                  <span
                    class="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-lg"
                  >
                    {{ point.icon }}
                  </span>
                  <div>
                    <p class="text-sm font-bold text-ink">{{ point.title }}</p>
                    <p class="mt-0.5 text-xs leading-relaxed text-ink-soft">
                      {{ point.body }}
                    </p>
                  </div>
                </li>
              }
            </ul>

            <div
              class="mt-6 flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50 p-3.5"
            >
              <span class="text-base">🔒</span>
              <p class="text-xs leading-relaxed text-ink-soft">
                بياناتك في أمان. الموقع بيتخزن في حسابك وبيتستخدم فقط عشان نرتب
                الأماكن، ومش بيشارك مع حد.
              </p>
            </div>

            @if (error()) {
              <div
                class="mt-5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm font-semibold text-red-700"
              >
                {{ error() }}
              </div>
            }

            <div class="mt-7 space-y-3">
              <button
                type="button"
                (click)="enable()"
                [disabled]="busy()"
                class="btn-accent w-full"
              >
                {{ busy() ? 'جاري تحديد موقعك...' : 'سماح باستخدام موقعي' }}
              </button>

              <button
                type="button"
                (click)="skip()"
                [disabled]="busy()"
                class="btn-ghost-dark w-full"
              >
                {{ canContinue() ? 'هكمل من غير الموقع' : 'تخطي' }}
              </button>
            </div>

            @if (status() === 'denied') {
              <p class="mt-4 text-center text-xs leading-relaxed text-ink-muted">
                متصفحك رفض الإذن. لو غيّرت رأيك، فعّل الموقع من إعدادات المتصفح
                لموقع Spacio، وبعدين ارجع هنا.
              </p>
            }
          </div>
        </div>
      </div>
    </div>
  `,
})
export class LocationPrompt {
  private location = inject(LocationService);
  private auth = inject(AuthService);
  private router = inject(Router);

  readonly benefits = [
    {
      icon: '🧭',
      title: 'نرتّب الأماكن حسب القرب منك',
      body: 'الأقرب ليك بيظهر الأول، مش الأحدث.',
    },
    {
      icon: '🔎',
      title: 'بحث أسرع',
      body: 'البحث بيستخدم موقعك تلقائياً بدل ما تكتبه كل مرة.',
    },
    {
      icon: '🔔',
      title: 'تنبيهات قريبة منك',
      body: 'Place الإصدارات والأماكن الجديدة اللي حواليك توصلك.',
    },
  ];

  readonly busy = signal(false);
  readonly error = signal('');
  readonly status = computed<LocationStatus>(() => this.location.status());

  /** Only offer to continue silently once there's a location to work with. */
  readonly canContinue = computed(() => this.status() === 'granted');

  enable(): void {
    this.busy.set(true);
    this.error.set('');

    this.location.request().subscribe((coords) => {
      this.busy.set(false);

      if (coords) {
        this.router.navigateByUrl(this.nextUrl());
        return;
      }

      this.error.set(
        this.status() === 'denied'
          ? 'رفضت إذن الموقع. تقدر تفعّله من إعدادات المتصفح.'
          : 'مقدرناش نحدد موقعك. اتأكد إن خدمة الموقع شغالة.',
      );
    });
  }

  skip(): void {
    this.router.navigateByUrl(this.nextUrl());
  }

  private nextUrl(): string {
    return this.auth.homeRouteForRole(this.auth.role());
  }
}
