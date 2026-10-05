import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../Services/auth.service';
import { UserRole } from '../models/models';

/** Requires a token. Sends anonymous visitors to /login. */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.hasToken()) return true;

  return router.createUrlTree(['/login'], {
    queryParams: { redirect: state.url },
  });
};

/**
 * Requires one of `roles`. Relies on the role already being in the stored
 * user, which is why AppComponent refreshes the profile on startup.
 */
export const roleGuard = (...roles: UserRole[]): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.hasToken()) {
      return router.createUrlTree(['/login']);
    }

    const role = auth.getStoredUser()?.role;

    if (role && roles.includes(role)) return true;

    // Signed in but not allowed here — send them to their own dashboard
    // rather than showing a dead end.
    return router.createUrlTree([auth.homeRouteForRole(role ?? null)]);
  };
};

/** Sends an already signed-in user away from /login and /register. */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.hasToken()) return true;

  return router.createUrlTree([
    auth.homeRouteForRole(auth.getStoredUser()?.role ?? null),
  ]);
};

/** Blocks /home for staff, who belong in their dashboards instead. */
export const userOnlyGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.hasToken()) return true;

  const role = auth.getStoredUser()?.role;
  if (role === 'user') return true;

  return router.createUrlTree([auth.homeRouteForRole(role ?? null)]);
};

/** Lets a signed-in user dismiss the location prompt for good. */
export const locationPermissionGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const permission = auth.getStoredUser()?.locationPermission;
  if (permission && permission !== 'pending') return true;

  return router.createUrlTree(['/welcome/location']);
};
