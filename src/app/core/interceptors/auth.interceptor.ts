import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '../Services/auth.service';

/** Endpoints that must never carry a token, and that a 401 is expected from. */
const PUBLIC_ENDPOINTS = ['/auth/login', '/auth/signup'];

/**
 * Attaches `Authorization: Bearer <token>` to every call except the public
 * auth endpoints, and centralises session-expiry handling.
 *
 * Without this the backend rejected every authenticated call with 401,
 * because no call site was sending the token.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getToken();

  const isPublicEndpoint = PUBLIC_ENDPOINTS.some((path) => req.url.includes(path));

  const request =
    token && !isPublicEndpoint
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      const reason = error.error?.reason;

      // The token expired or the account was disabled. Clear the session once
      // and let the guards send the user back to /login.
      //
      // This keys off `status === 401` alone rather than a URL allowlist: a
      // rejected token fails on whichever protected route happened to be
      // running (bookings, resources, dashboards), so scoping it to one
      // prefix would leave the app rendering as if signed in.
      if (error.status === 401 && token && !isPublicEndpoint) {
        auth.handleSessionExpired();
      } else if (reason === 'account_disabled') {
        auth.handleSessionExpired();
      }

      return throwError(() => error);
    }),
  );
};

