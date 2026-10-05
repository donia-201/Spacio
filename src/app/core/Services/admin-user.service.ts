import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environments';
import { ApiResponse, PagedResponse, User, UserRole } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AdminUserService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/auth/users`;

  // GET /auth/users?role&search&isActive
  list(
    options: {
      role?: UserRole;
      search?: string;
      isActive?: boolean;
      page?: number;
      limit?: number;
    } = {},
  ): Observable<PagedResponse<User>> {
    let params = new HttpParams();

    Object.entries(options).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      params = params.set(key, String(value));
    });

    return this.http.get<PagedResponse<User>>(this.baseUrl, { params });
  }

  // PATCH /auth/users/:id/role — how an admin grants or revokes a role.
  setRole(id: string, role: UserRole, isActive?: boolean): Observable<ApiResponse<User>> {
    return this.http.patch<ApiResponse<User>>(`${this.baseUrl}/${id}/role`, {
      role,
      isActive,
    });
  }
}
