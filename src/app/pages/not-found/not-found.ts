import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div class="w-full max-w-md text-center">
        <p class="text-6xl font-extrabold text-brand-600 tabular">404</p>
        <h1 class="mt-4 text-xl font-extrabold text-ink">الصفحة دي مش موجودة</h1>
        <p class="mt-2 text-sm leading-relaxed text-ink-soft">
          يمكن الرابط غلط، أو الصفحة اتشالت.
        </p>
        <a routerLink="/" class="btn-accent mt-7">الرجوع للرئيسية</a>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class NotFound {}
