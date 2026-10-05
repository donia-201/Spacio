import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '../../../core/Services/auth.service';
import { DashboardService } from '../../../core/Services/dashboard.service';

interface NavItem {
  label: string;
  path: string;
  exact?: boolean;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {
  public auth = inject(AuthService);
  private dashboardService = inject(DashboardService);
  private router = inject(Router);

  readonly menuOpen = signal(false);
  readonly unread = signal(0);
  readonly loggingOut = signal(false);

  readonly items = computed<NavItem[]>(() =>
    this.auth.isStaff()
      ? [
          { label: 'لوحتي', path: this.auth.homeRouteForRole(this.auth.role()) },
          { label: 'الإشعارات', path: '/notifications' },
          { label: 'الملف الشخصي', path: '/profile' },
        ]
      : [
          { label: 'الرئيسية', path: '/home', exact: true },
          { label: 'حجوزاتي', path: '/my-bookings' },
          { label: 'الإشعارات', path: '/notifications' },
          { label: 'الملف الشخصي', path: '/profile' },
        ],
  );

  get user() {
    return this.auth.currentUser();
  }

  get initials(): string {
    return `${this.user?.firstName?.[0] ?? ''}${this.user?.lastName?.[0] ?? ''}`;
  }

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) this.loadUnread();
  }

  private loadUnread(): void {
    this.dashboardService.summary().subscribe({
      next: (res) => this.unread.set(res.data?.unreadNotifications ?? 0),
      error: () => this.unread.set(0),
    });
  }

  toggle(): void {
    this.menuOpen.update((open) => !open);
  }

  close(): void {
    this.menuOpen.set(false);
  }

  logout(): void {
    this.loggingOut.set(true);
    this.auth.logout();
    this.close();
  }
}
