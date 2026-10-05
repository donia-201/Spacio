import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environments';
import {
  AdminDashboard,
  ApiResponse,
  TechnicianDashboard,
  UserDashboard,
  UserRole,
} from '../models/models';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/dashboard`;

  // GET /dashboard/summary — works for all three roles. The navbar polls it.
  summary(): Observable<
    ApiResponse<{
      unreadNotifications: number;
      role: UserRole;
      locationPermission: string;
    }>
  > {
    return this.http.get<
      ApiResponse<{
        unreadNotifications: number;
        role: UserRole;
        locationPermission: string;
      }>
    >(`${this.baseUrl}/summary`);
  }

  // GET /dashboard/user
  user(): Observable<ApiResponse<UserDashboard>> {
    return this.http.get<ApiResponse<UserDashboard>>(`${this.baseUrl}/user`);
  }

  // GET /dashboard/admin
  admin(): Observable<ApiResponse<AdminDashboard>> {
    return this.http.get<ApiResponse<AdminDashboard>>(`${this.baseUrl}/admin`);
  }

  // GET /dashboard/technician
  technician(): Observable<ApiResponse<TechnicianDashboard>> {
    return this.http.get<ApiResponse<TechnicianDashboard>>(`${this.baseUrl}/technician`);
  }
}
