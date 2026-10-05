import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environments';
import {
  ApiResponse,
  Category,
  Membership,
  OptionDetail,
  Organization,
  OrganizationType,
  OrganizationTypeMeta,
  PagedResponse,
  Resource,
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
export class OrganizationService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/organizations`;

  /**
   * GET /organizations
   * Pass `lat`/`lng`/`distance` to get results ordered nearest-first, each
   * row carrying `distanceMeters`.
   */
  list(
    options: {
      type?: OrganizationType | string;
      governorate?: string;
      search?: string;
      sort?: 'name' | 'newest';
      page?: number;
      limit?: number;
      lat?: number;
      lng?: number;
      distance?: number;
    } = {},
  ): Observable<PagedResponse<Organization>> {
    return this.http.get<PagedResponse<Organization>>(this.baseUrl, {
      params: toParams(options),
    });
  }

  // GET /organizations/categories?lat&lng&distance
  // Drives the home screen: counts, nearest distance and the options
  // available inside each category.
  categories(
    options: { lat?: number; lng?: number; distance?: number } = {},
  ): Observable<ApiResponse<{ withinDistance: number | null; categories: Category[] }>> {
    return this.http.get<
      ApiResponse<{ withinDistance: number | null; categories: Category[] }>
    >(`${this.baseUrl}/categories`, { params: toParams(options) });
  }

  // GET /organizations/nearby?lat&lng&distance&type
  nearby(
    options: { lat: number; lng: number; distance?: number; type?: string; limit?: number },
  ): Observable<PagedResponse<Organization>> {
    return this.http.get<PagedResponse<Organization>>(`${this.baseUrl}/nearby`, {
      params: toParams(options),
    });
  }

  // GET /organizations/meta/types — static catalog, no counts.
  types(): Observable<ApiResponse<OrganizationTypeMeta[]>> {
    return this.http.get<ApiResponse<OrganizationTypeMeta[]>>(`${this.baseUrl}/meta/types`);
  }

  // GET /organizations/:id — includes the type's `options`.
  byId(id: string): Observable<ApiResponse<Organization>> {
    return this.http.get<ApiResponse<Organization>>(`${this.baseUrl}/${id}`);
  }

  // GET /organizations/:id/resources
  resources(
    id: string,
    options: { type?: string; status?: string; page?: number; limit?: number } = {},
  ): Observable<PagedResponse<Resource>> {
    return this.http.get<PagedResponse<Resource>>(`${this.baseUrl}/${id}/resources`, {
      params: toParams(options),
    });
  }

  // =========================
  // Staff
  // =========================

  // GET /organizations/manageable
  manageable(): Observable<ApiResponse<Organization[]>> {
    return this.http.get<ApiResponse<Organization[]>>(`${this.baseUrl}/manageable`);
  }

  // GET /organizations/members/:id
  members(id: string, status?: string): Observable<ApiResponse<Membership[]>> {
    return this.http.get<ApiResponse<Membership[]>>(`${this.baseUrl}/members/${id}`, {
      params: toParams({ status }),
    });
  }

  // GET /organizations/pending-requests  (admin)
  pendingRequests(): Observable<ApiResponse<Membership[]>> {
    return this.http.get<ApiResponse<Membership[]>>(`${this.baseUrl}/pending-requests`);
  }

  // PATCH /organizations/:id/memberships/:membershipId
  decideMembership(
    organizationId: string,
    membershipId: string,
    decision: 'approved' | 'rejected',
    note?: string,
  ): Observable<ApiResponse<Membership>> {
    return this.http.patch<ApiResponse<Membership>>(
      `${this.baseUrl}/${organizationId}/memberships/${membershipId}`,
      { decision, note },
    );
  }

  // =========================
  // Admin writes
  // =========================

  create(payload: {
    name: string;
    slug: string;
    type: OrganizationType;
    address: string;
    governorate: string;
    city?: string;
    description?: string;
    coordinates: [number, number];
    contactEmail?: string;
    contactPhone?: string;
    website?: string;
    logo?: string;
    coverImage?: string;
  }): Observable<ApiResponse<Organization>> {
    return this.http.post<ApiResponse<Organization>>(this.baseUrl, payload);
  }

  update(id: string, payload: Partial<Record<string, unknown>>): Observable<ApiResponse<Organization>> {
    return this.http.patch<ApiResponse<Organization>>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: string): Observable<ApiResponse<{ _id: string }>> {
    return this.http.delete<ApiResponse<{ _id: string }>>(`${this.baseUrl}/${id}`);
  }

  /** The option chips rendered when someone opens a category. */
  optionsFor(category: Category | null | undefined): OptionDetail[] {
    return category?.options ?? [];
  }
}
