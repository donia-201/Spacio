/**
 * Production API base url. Swapped in for `environments.ts` by the
 * `fileReplacements` entry in angular.json, so nothing in the app imports this
 * file directly.
 *
 * Update this one line whenever the API moves.
 */
export const environment = {
  production: true,
  apiUrl: 'https://api.spacio.app',
};