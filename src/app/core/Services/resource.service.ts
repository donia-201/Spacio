import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environments';
import {
  ApiResponse,
  PagedResponse,
  Resource,
  ResourceStatus,
  ResourceType,
} from '../models/models';

const toParams = (source: Record<string, unknown>): HttpParams => {
  let params = new HttpParams();
  Object.entries(source).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    params = params.set(key, String(value));
  });
  return params;
};

@Injectable({ providedIn: 'root' })
export class ResourceService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/resources`;

  /**
   * GET /resources
   * With `lat`/`lng`/`distance` the response is ordered nearest-first and
   * every row carries `distanceMeters`, which is what the map needs.
   */
  list(
    options: {
      organization?: string;
      type?: ResourceType | string;
      status?: ResourceStatus | string;
      search?: string;
      governorate?: string;
      page?: number;
      limit?: number;
      lat?: number;
      lng?: number;
      distance?: number;
    } = {},
  ): Observable<PagedResponse<Resource>> {
    return this.http.get<PagedResponse<Resource>>(this.baseUrl, {
      params: toParams(options),
    });
  }

  // GET /resources/manageable — the technician's list.
  manageable(): Observable<ApiResponse<Resource[]>> {
    return this.http.get<ApiResponse<Resource[]>>(`${this.baseUrl}/manageable`);
  }

  byId(id: string): Observable<ApiResponse<Resource>> {
    return this.http.get<ApiResponse<Resource>>(`${this.baseUrl}/${id}`);
  }

  // =========================
  // Staff writes
  // =========================

  create(payload: {
    name: string;
    type: ResourceType;
    organization: string;
    governorate: string;
    coordinates: [number, number];
    description?: string;
    city?: string;
    address?: string;
    capacity?: number;
    amenities?: string[];
    requiresApproval?: boolean;
    image?: string;
    phone?: string;
    workingHours?: string;
  }): Observable<ApiResponse<Resource>> {
    return this.http.post<ApiResponse<Resource>>(this.baseUrl, payload);
  }

  update(id: string, payload: Partial<Record<string, unknown>>): Observable<ApiResponse<Resource>> {
    return this.http.patch<ApiResponse<Resource>>(`${this.baseUrl}/${id}`, payload);
  }

  // The technician's main action: available / booked / maintenance.
  setStatus(
    id: string,
    status: ResourceStatus,
    note?: string,
  ): Observable<ApiResponse<Resource>> {
    return this.http.patch<ApiResponse<Resource>>(`${this.baseUrl}/${id}/status`, {
      status,
      note,
    });
  }

  delete(id: string): Observable<ApiResponse<{ _id: string }>> {
    return this.http.delete<ApiResponse<{ _id: string }>>(`${this.baseUrl}/${id}`);
  }
}
