import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../../core/Services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div class="w-full max-w-lg">
        <a routerLink="/" class="mb-8 flex items-center gap-2.5">
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

        <div class="card-soft p-7 sm:p-8">
          <h1 class="text-2xl font-extrabold text-ink">أنشئ حسابك</h1>
          <p class="mt-1.5 text-sm text-ink-soft">
            مجاني بالكامل. تبدأ وتكتشف الأماكن حواليك على طول.
          </p>

          @if (error()) {
            <div
              class="mt-5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm font-semibold text-red-700"
            >
              {{ error() }}
            </div>
          }

          <form class="mt-7 space-y-4" (ngSubmit)="submit()">
            <div class="grid gap-4 sm:grid-cols-2">
              <div>
                <label for="firstName" class="mb-1.5 block text-sm font-bold text-ink">
                  الاسم الأول
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  autocomplete="given-name"
                  [(ngModel)]="firstName"
                  class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition-colors focus:border-brand-500"
                />
              </div>
              <div>
                <label for="lastName" class="mb-1.5 block text-sm font-bold text-ink">
                  اسم العائلة
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  autocomplete="family-name"
                  [(ngModel)]="lastName"
                  class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition-colors focus:border-brand-500"
                />
              </div>
            </div>

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
                class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition-colors focus:border-brand-500"
                placeholder="name@example.com"
              />
            </div>

            <div>
              <label for="phone" class="mb-1.5 block text-sm font-bold text-ink">
                رقم الموبايل <span class="font-normal text-ink-muted">(اختياري)</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                dir="ltr"
                [(ngModel)]="phone"
                class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition-colors focus:border-brand-500"
                placeholder="01xxxxxxxxx"
              />
            </div>

            <div>
              <label for="password" class="mb-1.5 block text-sm font-bold text-ink">
                كلمة المرور
              </label>
              <input
                id="password"
                name="password"
                type="password"
                dir="ltr"
                required
                minlength="8"
                autocomplete="new-password"
                [(ngModel)]="password"
                (ngModelChange)="onPassword($event)"
                class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition-colors focus:border-brand-500"
                placeholder="8 أحرف على الأقل"
              />
              <!-- Live strength meter -->
              @if (password) {
                <div class="mt-2 flex items-center gap-2">
                  <div class="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                    <div
                      class="h-full rounded-full transition-all duration-300"
                      [class]="strengthColor()"
                      [style.width.%]="strengthPercent()"
                    ></div>
                  </div>
                  <span class="text-[11px] font-bold" [class]="strengthTextColor()">
                    {{ strengthLabel() }}
                  </span>
                </div>
              }
            </div>

            <label class="flex cursor-pointer items-start gap-2.5 pt-1">
              <input
                name="terms"
                type="checkbox"
                required
                [(ngModel)]="accepted"
                class="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-brand-600"
              />
              <span class="text-xs leading-relaxed text-ink-soft">
                أوافق على شروط الاستخدام وسياسة الخصوصية.
              </span>
            </label>

            <button
              type="submit"
              [disabled]="busy() || !accepted"
              class="btn-accent w-full disabled:cursor-not-allowed disabled:opacity-60"
            >
              {{ busy() ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب' }}
            </button>
          </form>
        </div>

        <p class="mt-6 text-center text-sm text-ink-soft">
          عندك حساب بالفعل؟
          <a routerLink="/login" class="font-bold text-brand-700 hover:underline">سجّل دخولك</a>
        </p>
      </div>
    </div>
  `,
})
export class Register {
  private auth = inject(AuthService);
  private router = inject(Router);

  firstName = '';
  lastName = '';
  email = '';
  phone = '';
  password = '';
  accepted = false;

  readonly busy = signal(false);
  readonly error = signal('');

  // 0-3, used for the meter width
  readonly strength = signal(0);

  private score(): number {
    const value = this.password;
    if (!value) return 0;

    let score = 0;
    if (value.length >= 8) score++;
    if (value.length >= 12) score++;
    if (/[A-Z]/.test(value) || /[0-9]/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value)) score++;

    return Math.min(score, 3);
  }

  strengthPercent(): number {
    return (this.strength() / 3) * 100;
  }

  strengthLabel(): string {
    return ['', 'ضعيفة', 'متوسطة', 'قوية'][this.strength()];
  }

  strengthColor(): string {
    return [
      '',
      'bg-red-500',
      'bg-amber-500',
      'bg-brand-500',
    ][this.strength()];
  }

  strengthTextColor(): string {
    return ['', 'text-red-600', 'text-amber-600', 'text-brand-700'][this.strength()];
  }

  onPassword(value: string): void {
    this.password = value;
    this.strength.set(this.score());
  }

  submit(): void {
    this.error.set('');
    this.strength.set(this.score());
    this.busy.set(true);

    this.auth
      .signup({
        firstName: this.firstName.trim(),
        lastName: this.lastName.trim(),
        email: this.email.trim(),
        password: this.password,
        phone: this.phone.trim() || undefined,
      })
      .pipe(finalize(() => this.busy.set(false)))
      .subscribe({
        next: (res) => {
          if (!res.success) {
            this.error.set(res.message ?? 'مقدرناش ننشئ الحساب.');
            return;
          }

          // The role is always assigned server-side. The next step is the
          // location prompt, which is what makes the product useful.
          this.router.navigateByUrl('/welcome/location');
        },
        error: (err) => {
          this.error.set(err?.error?.message ?? 'حصل خطأ. حاول تاني.');
        },
      });
  }
}
