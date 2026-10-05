/**
 * Legacy path kept so old imports don't break.
 *
 * The real service is `../auth.service`; this used to be a second class
 * literally named `AuthService` with a different token key (`token` vs
 * `spacio_token`), which silently diverged from the one in use.
 */
export { AuthService } from '../auth.service';
