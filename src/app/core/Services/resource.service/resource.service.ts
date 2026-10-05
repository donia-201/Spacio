/**
 * Legacy path kept so old imports don't break.
 *
 * The real service is `../resource.service`. This was a second class with the
 * same name, a hardcoded base URL, and a `getResources()` that returned
 * `Observable<any>` — so it type-checked while quietly bypassing the typed
 * contract.
 */
export { ResourceService } from '../resource.service';
