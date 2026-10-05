import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environments';
import { ApiResponse, AppNotification, PagedResponse } from '../models/models';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/notifications`;

  // GET /notifications — `unreadCount` comes back on every call.
  list(
    options: { page?: number; limit?: number; unread?: boolean; type?: string } = {},
  ): Observable<PagedResponse<AppNotification> & { unreadCount: number }> {
    let params = new HttpParams();
    if (options.page) params = params.set('page', String(options.page));
    if (options.limit) params = params.set('limit', String(options.limit));
    if (options.unread) params = params.set('unread', 'true');
    if (options.type) params = params.set('type', options.type);

    return this.http.get<PagedResponse<AppNotification> & { unreadCount: number }>(
      this.baseUrl,
      { params },
    );
  }

  // GET /notifications/unread-count — polled for the navbar bell badge.
  unreadCount(): Observable<ApiResponse<{ unreadCount: number }>> {
    return this.http.get<ApiResponse<{ unreadCount: number }>>(
      `${this.baseUrl}/unread-count`,
    );
  }

  markRead(id: string): Observable<ApiResponse<AppNotification>> {
    return this.http.patch<ApiResponse<AppNotification>>(`${this.baseUrl}/${id}/read`, {});
  }

  markAllRead(): Observable<ApiResponse<{ updated: number }>> {
    return this.http.patch<ApiResponse<{ updated: number }>>(`${this.baseUrl}/read-all`, {});
  }

  remove(id: string): Observable<ApiResponse<never>> {
    return this.http.delete<ApiResponse<never>>(`${this.baseUrl}/${id}`);
  }
}
