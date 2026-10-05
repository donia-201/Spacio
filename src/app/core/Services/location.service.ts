import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, of, tap } from 'rxjs';

import { AuthService } from './auth.service';

export interface Coords {
  latitude: number;
  longitude: number;
}

export type LocationStatus =
  | 'idle'
  | 'prompting'
  | 'granted'
  | 'denied'
  | 'unsupported'
  | 'error';

@Injectable({ providedIn: 'root' })
export class LocationService {
  private auth = inject(AuthService);

  private readonly coordsSignal = signal<Coords | null>(this.readCoords());
  private readonly statusSignal = signal<LocationStatus>(
    this.coordsSignal() ? 'granted' : 'idle',
  );

  /** The browser's position, if we have one. */
  readonly coords = this.coordsSignal.asReadonly();
  readonly status = this.statusSignal.asReadonly();
  readonly hasCoords = () => this.coordsSignal() !== null;

  /**
   * Asks the browser for a position, then persists it to
   * `PATCH /auth/location` so the backend can sort everything by distance.
   *
   * Pass `silent` for the auto-try on startup — the browser remembers an
   * earlier decision, so a second prompt would be confusing.
   */
  request(silent = false): Observable<Coords | null> {
    if (!('geolocation' in navigator)) {
      this.statusSignal.set('unsupported');
      return of(null);
    }

    if (!silent) this.statusSignal.set('prompting');

    return new Observable<Coords | null>((subscriber) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: Coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };

          this.statusSignal.set('granted');
          this.coordsSignal.set(coords);

          // The whole flow hinges on this landing: the backend uses the saved
          // position to order categories and results by distance.
          this.auth
            .saveLocation({ ...coords, permission: 'granted' })
            .pipe(catchError(() => of(null)))
            .subscribe(() => {
              localStorage.setItem('spacio_coords', JSON.stringify(coords));
              subscriber.next(coords);
              subscriber.complete();
            });
        },
        (error) => {
          const denied = error.code === error.PERMISSION_DENIED;
          this.statusSignal.set(denied ? 'denied' : 'error');

          // Record the refusal so the backend stops nagging.
          if (denied) {
            this.auth
              .saveLocation({ latitude: 0, longitude: 0, permission: 'denied' })
              .pipe(catchError(() => of(null)))
              .subscribe();
          }

          subscriber.next(null);
          subscriber.complete();
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
      );
    });
  }

  /** Query params for the geo endpoints, or null when there's no position. */
  geoParams(extra: Record<string, string | number> = {}): Record<string, string | number> | null {
    const coords = this.coordsSignal();
    if (!coords) return null;

    return {
      lat: coords.latitude,
      lng: coords.longitude,
      distance: this.auth.currentUser()?.searchRadius ?? 5000,
      ...extra,
    };
  }

  private readCoords(): Coords | null {
    try {
      const raw = localStorage.getItem('spacio_coords');
      return raw ? (JSON.parse(raw) as Coords) : null;
    } catch {
      return null;
    }
  }
}
