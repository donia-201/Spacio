import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../core/Services/auth.service';
import { Navbar } from '../../shared/components/navbar/navbar';

interface DashLink {
  label: string;
  path: string;
  exact?: boolean;
}

@Component({
  selector: 'app-technician-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, Navbar],
  template: `
    <div class="flex min-h-screen flex-col bg-slate-50">
      <app-navbar />

      <div class="container-page flex-1 py-8">
        <div class="grid gap-6 lg:grid-cols-[220px_1fr]">
          <aside>
            <nav class="card-soft sticky top-24 flex gap-1 overflow-x-auto p-2 lg:flex-col">
              @for (link of links; track link.path) {
                <a
                  [routerLink]="link.path"
                  routerLinkActive="!border-brand-600 !bg-brand-50 !text-brand-700"
                  [routerLinkActiveOptions]="{ exact: link.exact ?? false }"
                  class="shrink-0 rounded-lg border border-transparent px-3.5 py-2.5 text-sm font-semibold text-ink-soft transition-colors hover:bg-slate-50 hover:text-ink"
                >
                  {{ link.label }}
                </a>
              }

              <div class="my-2 hidden border-t border-slate-200 lg:block"></div>

              <a
                routerLink="/home"
                class="shrink-0 rounded-lg border border-transparent px-3.5 py-2.5 text-sm font-semibold text-ink-soft transition-colors hover:bg-slate-50 hover:text-ink"
              >
                عرض المنصة
              </a>
              <button
                type="button"
                (click)="logout()"
                class="shrink-0 rounded-lg px-3.5 py-2.5 text-right text-sm font-bold text-red-600 transition-colors hover:bg-red-50"
              >
                تسجيل الخروج
              </button>
            </nav>
          </aside>

          <main class="min-w-0">
            <router-outlet />
          </main>
        </div>
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
export class TechnicianLayout {
  private auth = inject(AuthService);
  private router = inject(Router);

  readonly links: DashLink[] = [
    { label: 'لوحتي', path: '/technician', exact: true },
    { label: 'الإشعارات', path: '/notifications' },
    { label: 'الملف الشخصي', path: '/profile' },
  ];

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
