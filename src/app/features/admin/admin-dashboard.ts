import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardService } from '../../core/Services/dashboard.service';
import { AuthService } from '../../core/Services/auth.service';
import { AdminDashboard } from '../../core/models/models';
import { StatusPipe } from '../../shared/pipes/status-pipe';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, StatusPipe],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboardPage implements OnInit {
  private dashboardService = inject(DashboardService);
  public auth = inject(AuthService);

  readonly data = signal<AdminDashboard | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.dashboardService.admin().subscribe({
      next: (res) => this.data.set(res.data ?? null),
      error: () => this.error.set('مقدرناش نحمّل بيانات اللوحة.'),
      complete: () => this.loading.set(false),
    });
  }

  /** Flatten a `Record<string, number>` into a list the template can loop. */
  pairs(record?: Record<string, number>): Array<[string, number]> {
    return Object.entries(record ?? {});
  }
}
