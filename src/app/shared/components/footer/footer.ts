import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="border-t border-slate-200 bg-white py-9">
      <div class="container-page">
        <div
          class="flex flex-col items-center justify-between gap-5 sm:flex-row sm:items-center"
        >
          <!-- Brand -->
          <div class="flex items-center gap-2.5">
            <span
              class="grid h-9 w-9 place-items-center rounded-xl bg-accent-600 text-white"
            >
              <svg viewBox="0 0 24 24" fill="none" class="h-4 w-4" aria-hidden="true">
                <path
                  d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linejoin="round"
                />
                <circle cx="12" cy="10" r="2.5" fill="currentColor" />
              </svg>
            </span>
            <div class="leading-tight">
              <p lang="en" class="font-extrabold text-ink">Spacio</p>
              <p class="text-[11px] text-ink-muted">احجز مكانك.. بكل سهولة</p>
            </div>
          </div>

          <!-- Links -->
          <nav class="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-semibold">
            <a routerLink="/home" class="text-ink-soft transition-colors hover:text-brand-700">
              الرئيسية
            </a>
            <a routerLink="/my-bookings" class="text-ink-soft transition-colors hover:text-brand-700">
              حجوزاتي
            </a>
            <a routerLink="/notifications" class="text-ink-soft transition-colors hover:text-brand-700">
              الإشعارات
            </a>
            <a routerLink="/profile" class="text-ink-soft transition-colors hover:text-brand-700">
              الملف الشخصي
            </a>
          </nav>
        </div>

        <p class="mt-7 text-center text-[11px] text-ink-muted">
          © 2026 Spacio — منصّة الحجز الذكي للأماكن والخدمات.
        </p>
      </div>
    </footer>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class Footer {}
