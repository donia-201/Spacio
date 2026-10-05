import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environments';
import { ApiResponse, User, UserRole } from '../models/models';

const TOKEN_KEY = 'spacio_token';
const USER_KEY = 'spacio_user';

interface SignupPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface AuthResult {
  success: boolean;
  message?: string;
  token?: string;
  data?: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private apiUrl = `${environment.apiUrl}/auth`;

  // Signals drive every template, so no component needs a manual subscribe.
  private readonly userSignal = signal<User | null>(this.readStoredUser());

  readonly currentUser = this.userSignal.asReadonly();
  readonly isLoggedIn = computed(() => !!this.getToken());

  readonly role = computed<UserRole | null>(() => this.userSignal()?.role ?? null);
  readonly isAdmin = computed(() => this.role() === 'admin');
  readonly isTechnician = computed(() => this.role() === 'technician');
  readonly isStaff = computed(() => this.isAdmin() || this.isTechnician());

  // True until the user answers the location prompt. Drives the banner.
  readonly needsLocation = computed(
    () => this.userSignal()?.locationPermission === 'pending',
  );

  // =========================
  // Session
  // =========================

  signup(payload: SignupPayload): Observable<AuthResult> {
    return this.http
      .post<AuthResult>(`${this.apiUrl}/signup`, payload)
      .pipe(tap((res) => this.persistSession(res)));
  }

  login(payload: LoginPayload): Observable<AuthResult> {
    return this.http
      .post<AuthResult>(`${this.apiUrl}/login`, payload)
      .pipe(tap((res) => this.persistSession(res)));
  }

  // GET /auth/profile — the authoritative source for role and location
  // state. Called on every app start so a role change takes effect.
  refreshProfile(): Observable<ApiResponse<User>> {
    return this.http
      .get<ApiResponse<User>>(`${this.apiUrl}/profile`)
      .pipe(tap((res) => this.setUser(res.data ?? null)));
  }

  updateProfile(payload: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    profileImage?: { secure_url: string; public_id: string };
  }): Observable<ApiResponse<User>> {
    return this.http
      .patch<ApiResponse<User>>(`${this.apiUrl}/profile`, payload)
      .pipe(tap((res) => this.setUser(res.data ?? null)));
  }

  changePassword(oldPassword: string, newPassword: string): Observable<ApiResponse<never>> {
    return this.http.patch<ApiResponse<never>>(`${this.apiUrl}/change-password`, {
      oldPassword,
      newPassword,
    });
  }

  // PATCH /auth/location — where the browser's geolocation result lands.
  saveLocation(payload: {
    latitude: number;
    longitude: number;
    governorate?: string;
    city?: string;
    permission?: 'granted' | 'denied';
  }): Observable<ApiResponse<User>> {
    return this.http
      .patch<ApiResponse<User>>(`${this.apiUrl}/location`, payload)
      .pipe(tap((res) => this.setUser(res.data ?? null)));
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.userSignal.set(null);
    this.router.navigate(['/login']);
  }

  // Called by the interceptor when the backend rejects the token.
  handleSessionExpired(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.userSignal.set(null);
    this.router.navigate(['/login'], {
      queryParams: { reason: 'session_expired' },
    });
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  // Used by the guards before the profile request has resolved.
  hasToken(): boolean {
    return !!this.getToken();
  }

  getStoredUser(): User | null {
    return this.readStoredUser();
  }

  // The dashboard each role lands on after signing in.
  homeRouteForRole(role: UserRole | null): string {
    switch (role) {
      case 'admin':
        return '/admin';
      case 'technician':
        return '/technician';
      default:
        return '/home';
    }
  }

  private persistSession(res: AuthResult): void {
    if (res.token) localStorage.setItem(TOKEN_KEY, res.token);
    this.setUser(res.data ?? null);
  }

  private setUser(user: User | null): void {
    this.userSignal.set(user);
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }

  private readStoredUser(): User | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  }
}
