import { Injectable, signal } from '@angular/core';

/**
 * Loads Leaflet once, on demand, from a CDN.
 *
 * Deliberately not an npm dependency: this keeps `package.json` untouched
 * and means the map works without anyone having to install anything. The
 * stylesheet is injected alongside the script because Leaflet's CSS is
 * required for tiles and markers to position correctly.
 */
const LEAFLET_VERSION = '1.9.4';
const CSS_URL = `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/leaflet.css`;
const JS_URL = `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/leaflet.js`;

declare global {
  interface Window {
    L?: any;
  }
}

@Injectable({ providedIn: 'root' })
export class LeafletLoader {
  private loading?: Promise<any>;

  readonly ready = signal(false);
  readonly failed = signal(false);

  load(): Promise<any> {
    if (window.L) {
      this.ready.set(true);
      return Promise.resolve(window.L);
    }

    if (this.loading) return this.loading;

    this.loading = new Promise<any>((resolve, reject) => {
      if (!document.querySelector(`link[href="${CSS_URL}"]`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = CSS_URL;
        document.head.appendChild(link);
      }

      const script = document.createElement('script');
      script.src = JS_URL;
      script.async = true;

      script.onload = () => {
        if (window.L) {
          this.ready.set(true);
          resolve(window.L);
        } else {
          this.failed.set(true);
          reject(new Error('Leaflet loaded but window.L is missing'));
        }
      };

      script.onerror = () => {
        this.failed.set(true);
        reject(new Error('Could not load Leaflet'));
      };

      document.head.appendChild(script);
    });

    return this.loading;
  }
}
