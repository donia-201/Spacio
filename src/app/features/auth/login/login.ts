import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../../core/Services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="grid min-h-screen lg:grid-cols-2">
      <!-- Brand panel: hidden on mobile so the form owns the screen -->
      <aside
        class="relative isolate hidden overflow-hidden bg-brand-800 p-12 text-white lg:flex lg:flex-col lg:justify-between"
      >
        <div
          class="absolute inset-0 -z-10 opacity-20"
          style="
            background-image: radial-gradient(circle at 1px 1px, rgba(255,255,255,.45) 1px, transparent 0);
            background-size: 24px 24px;
          "
          aria-hidden="true"
        ></div>

        <a routerLink="/" class="flex items-center gap-2.5">
          <span class="grid h-10 w-10 place-items-center rounded-xl bg-accent-600">
            <svg viewBox="0 0 24 24" fill="none" class="h-5 w-5" aria-hidden="true">
              <path
                d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linejoin="round"
              />
              <circle cx="12" cy="10" r="2.5" fill="currentColor" />
            </svg>
          </span>
          <span lang="en" class="text-lg font-extrabold">Spacio</span>
        </a>

        <div class="max-w-md">
          <h1 class="text-3xl font-extrabold leading-snug">
            أهلاً بعودتك — الأماكن اللي حواليك مستنياك.
          </h1>
          <p class="mt-4 leading-relaxed text-brand-50">
            سجّل دخولك وشوف أقرب الأماكن ليك، واحجز في ثوانٍ.
          </p>

          <ul class="mt-8 space-y-3 text-sm">
            @for (point of ['مستشفيات ومكاتب قريبة منك', 'مساحات عمل وقاعات', 'حجز فوري بدون أوراق']; track point) {
              <li class="flex items-center gap-2.5">
                <span class="grid h-6 w-6 place-items-center rounded-full bg-white/15 text-xs">
                  ✓
                </span>
                {{ point }}
              </li>
            }
          </ul>
        </div>

        <p class="text-xs text-brand-100/70">© 2026 Spacio</p>
      </aside>

      <!-- Form -->
      <div class="flex items-center justify-center bg-white px-4 py-12">
        <div class="w-full max-w-md">
          <a routerLink="/" class="mb-8 flex items-center gap-2.5 lg:hidden">
            <span class="grid h-10 w-10 place-items-center rounded-xl bg-accent-600 text-white">
              <svg viewBox="0 0 24 24" fill="none" class="h-5 w-5" aria-hidden="true">
                <path
                  d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linejoin="round"
                />
                <circle cx="12" cy="10" r="2.5" fill="currentColor" />
              </svg>
            </span>
            <span lang="en" class="text-lg font-extrabold text-ink">Spacio</span>
          </a>

          <h2 class="text-2xl font-extrabold text-ink">تسجيل الدخول</h2>
          <p class="mt-1.5 text-sm text-ink-soft">
            مفيش حساب؟
            <a routerLink="/register" class="font-bold text-brand-700 hover:underline">
              أنشئ واحد
            </a>
          </p>

          @if (notice()) {
            <div
              class="mt-5 rounded-xl border border-brand-200 bg-brand-50 p-3.5 text-sm font-semibold text-brand-800"
            >
              {{ notice() }}
            </div>
          }

          <form class="mt-7 space-y-4" (ngSubmit)="submit()">
            <div>
              <label for="email" class="mb-1.5 block text-sm font-bold text-ink">
                البريد الإلكتروني
              </label>
              <input
                id="email"
                name="email"
                type="email"
                dir="ltr"
                required
                autocomplete="email"
                [(ngModel)]="email"
                class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-brand-500"
                placeholder="name@example.com"
              />
            </div>

            <div>
              <label for="password" class="mb-1.5 block text-sm font-bold text-ink">
                كلمة المرور
              </label>
              <div class="relative">
                <input
                  id="password"
                  name="password"
                  [type]="showPassword() ? 'text' : 'password'"
                  dir="ltr"
                  required
                  autocomplete="current-password"
                  [(ngModel)]="password"
                  class="w-full rounded-xl border border-slate-300 px-4 py-3 pl-11 text-sm text-ink outline-none transition-colors focus:border-brand-500"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  (click)="showPassword.set(!showPassword())"
                  class="absolute inset-y-0 left-0 grid w-11 place-items-center text-ink-muted hover:text-brand-700"
                  [attr.aria-label]="showPassword() ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'"
                >
                  @if (showPassword()) {
                    <svg viewBox="0 0 24 24" fill="none" class="h-5 w-5" aria-hidden="true">
                      <path d="M3 3l18 18M10.6 10.6a3 3 0 0 0 4.2 4.2M9.9 5.2A9.6 9.6 0 0 1 12 5c5 0 9 4.5 9 7 0 .9-.5 1.8-1.4 2.6M6.2 6.7C4.2 8 3 10.2 3 12c0 2.5 4 7 9 7 1.3 0 2.5-.3 3.5-.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                    </svg>
                  } @else {
                    <svg viewBox="0 0 24 24" fill="none" class="h-5 w-5" aria-hidden="true">
                      <path d="M3 12c0-2.5 4-7 9-7s9 4.5 9 7-4 7-9 7-9-4.5-9-7Z" stroke="currentColor" stroke-width="1.8" />
                      <circle cx="12" cy="12" r="2.8" stroke="currentColor" stroke-width="1.8" />
                    </svg>
                  }
                </button>
              </div>
            </div>

            @if (error()) {
              <div
                class="rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm font-semibold text-red-700"
              >
                {{ error() }}
              </div>
            }

            <button type="submit" [disabled]="busy()" class="btn-accent w-full">
              {{ busy() ? 'جاري الدخول...' : 'تسجيل الدخول' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class Login {
  private auth = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';

  readonly busy = signal(false);
  readonly error = signal('');
  readonly showPassword = signal(false);
  readonly notice = signal('');

  constructor() {
    // A 401 from the interceptor redirects here with a reason.
    const reason = this.router.parseUrl(this.router.url).queryParams['reason'];
    if (reason === 'session_expired') {
      this.notice.set('انتهت الجلسة. سجّل دخولك تاني.');
    }
  }

  submit(): void {
    this.error.set('');
    this.busy.set(true);

    this.auth
      .login({ email: this.email.trim(), password: this.password })
      .pipe(finalize(() => this.busy.set(false)))
      .subscribe({
        next: (res) => {
          if (!res.success) {
            this.error.set(res.message ?? 'مقدرناش نسجّل دخولك.');
            return;
          }

          const user = res.data;
          // Signup already dropped the token, so send them to the prompt
          // before the home screen.
          if (user?.locationPermission === 'pending') {
            this.router.navigateByUrl('/welcome/location');
            return;
          }

          this.router.navigateByUrl(this.auth.homeRouteForRole(user?.role ?? null));
        },
        error: (err) => {
          this.error.set(err?.error?.message ?? 'حصل خطأ. حاول تاني.');
        },
      });
  }
}
