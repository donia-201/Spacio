import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environments';
import { ApiResponse, Membership, MembershipRole } from '../models/models';

@Injectable({ providedIn: 'root' })
export class MembershipService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/memberships`;

  // POST /memberships/join
  join(organizationId: string, role: MembershipRole): Observable<ApiResponse<Membership>> {
    return this.http.post<ApiResponse<Membership>>(`${this.baseUrl}/join`, {
      organizationId,
      role,
    });
  }

  // GET /memberships/my-organizations — approved by default.
  mine(status?: 'pending' | 'approved' | 'rejected'): Observable<ApiResponse<Membership[]>> {
    return this.http.get<ApiResponse<Membership[]>>(`${this.baseUrl}/my-organizations`, {
      params: status ? { status } : {},
    });
  }

  // GET /memberships/requests — the queue this user can act on.
  requests(status = 'pending'): Observable<ApiResponse<Membership[]>> {
    return this.http.get<ApiResponse<Membership[]>>(`${this.baseUrl}/requests`, {
      params: { status },
    });
  }

  approve(id: string): Observable<ApiResponse<Membership>> {
    return this.http.patch<ApiResponse<Membership>>(`${this.baseUrl}/approve/${id}`, {});
  }

  reject(id: string): Observable<ApiResponse<Membership>> {
    return this.http.patch<ApiResponse<Membership>>(`${this.baseUrl}/reject/${id}`, {});
  }

  // DELETE /memberships/:id
  leave(id: string): Observable<ApiResponse<never>> {
    return this.http.delete<ApiResponse<never>>(`${this.baseUrl}/${id}`);
  }
}
