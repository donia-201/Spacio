import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environments';
import { ApiResponse, Booking, BookingStatus, PagedResponse } from '../models/models';

const toParams = (source: Record<string, unknown>): HttpParams => {
  let params = new HttpParams();
  Object.entries(source).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    params = params.set(key, String(value));
  });
  return params;
};

@Injectable({ providedIn: 'root' })
export class BookingService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/bookings`;

  // POST /bookings
  // `organization` is the id of the organization that owns `resourceId`.
  create(payload: {
    resource: string;
    organization: string;
    startTime: string;
    endTime: string;
    notes?: string;
  }): Observable<ApiResponse<Booking>> {
    return this.http.post<ApiResponse<Booking>>(this.baseUrl, payload);
  }

  // GET /bookings/my-bookings
  mine(
    options: { page?: number; limit?: number; status?: BookingStatus | string } = {},
  ): Observable<PagedResponse<Booking>> {
    return this.http.get<PagedResponse<Booking>>(`${this.baseUrl}/my-bookings`, {
      params: toParams(options),
    });
  }

  // GET /bookings/manageable — the staff review queue.
  manageable(
    options: { page?: number; limit?: number; status?: BookingStatus | string } = {},
  ): Observable<PagedResponse<Booking>> {
    return this.http.get<PagedResponse<Booking>>(`${this.baseUrl}/manageable`, {
      params: toParams(options),
    });
  }

  byId(id: string): Observable<ApiResponse<Booking>> {
    return this.http.get<ApiResponse<Booking>>(`${this.baseUrl}/${id}`);
  }

  approve(id: string, note?: string): Observable<ApiResponse<Booking>> {
    return this.http.patch<ApiResponse<Booking>>(`${this.baseUrl}/${id}/approve`, { note });
  }

  reject(id: string, note?: string): Observable<ApiResponse<Booking>> {
    return this.http.patch<ApiResponse<Booking>>(`${this.baseUrl}/${id}/reject`, { note });
  }

  complete(id: string): Observable<ApiResponse<Booking>> {
    return this.http.patch<ApiResponse<Booking>>(`${this.baseUrl}/${id}/complete`, {});
  }

  cancel(id: string, note?: string): Observable<ApiResponse<Booking>> {
    return this.http.patch<ApiResponse<Booking>>(`${this.baseUrl}/${id}/cancel`, { note });
  }
}
