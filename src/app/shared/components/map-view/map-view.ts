import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { LeafletLoader } from '../../../core/Services/leaflet-loader.service';

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  label: string;
  emoji?: string;
  /** Renders in the brand accent to stand out from the result markers. */
  highlight?: boolean;
}

export interface MapRoute {
  from: { lat: number; lng: number };
  to: { lat: number; lng: number };
  /** Straight-line metres, precomputed by the caller. */
  distanceMeters?: number;
}

/**
 * A read-only map. Renders result markers and, when `route` is set, a line
 * from the user to the selected institution.
 */
@Component({
  selector: 'app-map-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative h-full w-full">
      <div #mapEl class="h-full w-full"></div>

      @if (loading()) {
        <div
          class="absolute inset-0 grid place-items-center bg-slate-50 text-sm font-semibold text-ink-muted"
        >
          جاري تحميل الخريطة...
        </div>
      } @else if (error()) {
        <div
          class="absolute inset-0 grid place-items-center bg-slate-50 px-6 text-center text-sm text-ink-soft"
        >
          <div>
            <p class="font-bold text-ink">الخريطة مش متاحة دلوقتي</p>
            <p class="mt-1 text-ink-muted">{{ error() }}</p>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
        min-height: 320px;
      }
    `,
  ],
})
export class MapView implements AfterViewInit, OnChanges, OnDestroy {
  @Input() markers: MapMarker[] = [];
  @Input() route: MapRoute | null = null;
  @Input() zoom = 13;

  // Signal-based equivalents, so templates can read load state.
  readonly loading = signal(true);
  readonly error = signal('');

  @ViewChild('mapEl', { static: true }) mapEl!: ElementRef<HTMLDivElement>;

  private map: any;
  private layerGroup: any;

  private get L(): any {
    return window.L;
  }

  constructor(private leaflet: LeafletLoader) {}

  ngAfterViewInit(): void {
    this.leaflet
      .load()
      .then(() => {
        this.init();
        this.loading.set(false);
      })
      .catch((err: Error) => {
        this.error.set(err.message);
        this.loading.set(false);
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.map) return;
    if (changes['markers'] || changes['route']) this.render();
  }

  ngOnDestroy(): void {
    // Leaflet keeps listeners on window even after the element is gone.
    this.map?.remove();
    this.map = null;
  }

  private init(): void {
    const L = this.L;

    const start = this.route?.from ?? this.markers[0];
    const center: [number, number] = start
      ? [start.lat, start.lng]
      : [30.0444, 31.2357]; // Cairo, used when there's nothing to centre on

    this.map = L.map(this.mapEl.nativeElement, {
      center,
      zoom: this.zoom,
      scrollWheelZoom: false, // so the page doesn't hijack the wheel
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(this.map);

    this.layerGroup = L.layerGroup().addTo(this.map);
    this.render();
  }

  private render(): void {
    const L = this.L;
    if (!this.map || !this.layerGroup) return;

    this.layerGroup.clearLayers();
    const bounds: any[] = [];

    // --- Route from the user to the selected institution ---
    if (this.route) {
      const { from, to } = this.route;

      L.polyline([[from.lat, from.lng], [to.lat, to.lng]], {
        color: '#ea580c',
        weight: 3,
        opacity: 0.85,
        dashArray: '8 8',
      }).addTo(this.layerGroup);

      L.circle([from.lat, from.lng], {
        radius: 60,
        color: '#0f766e',
        weight: 1,
        fillColor: '#14b8a6',
        fillOpacity: 0.15,
      }).addTo(this.layerGroup);

      L.marker([from.lat, from.lng], {
        icon: this.pin('📍', 'bg-white'),
        zIndexOffset: 1000,
      })
        .addTo(this.layerGroup)
        .bindPopup('موقعك');

      L.marker([to.lat, to.lng], {
        icon: this.pin(this.markers[0]?.emoji ?? '📌', 'bg-accent-600'),
        zIndexOffset: 1000,
      })
        .addTo(this.layerGroup)
        .bindPopup(
          `<strong dir="rtl">${this.markers[0]?.label ?? 'المكان'}</strong>` +
            (this.route.distanceMeters !== undefined
              ? `<br><span dir="rtl">${formatMeters(this.route.distanceMeters)} منك</span>`
              : ''),
        );

      bounds.push([from.lat, from.lng], [to.lat, to.lng]);
    }

    // --- Result markers ---
    this.markers.forEach((marker) => {
      if (this.route && marker.id === this.markers[0]?.id) return;

      L.marker([marker.lat, marker.lng], {
        icon: this.pin(marker.emoji ?? '📍', marker.highlight ? 'bg-accent-600' : 'bg-brand-600'),
      })
        .addTo(this.layerGroup)
        .bindPopup(`<span dir="rtl">${marker.label}</span>`);

      bounds.push([marker.lat, marker.lng]);
    });

    if (bounds.length === 1) {
      this.map.setView(bounds[0], this.zoom);
    } else if (bounds.length > 1) {
      this.map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
    }
  }

  private pin(emoji: string, background: string) {
    const L = this.L;
    return L.divIcon({
      className: '',
      html: `<span style="
        display:grid;place-items:center;
        width:34px;height:34px;border-radius:9999px;
        background:${background};color:#fff;font-size:15px;
        box-shadow:0 6px 14px -4px rgba(15,23,42,.45);
        border:2px solid #fff;
      ">${emoji}</span>`,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
      popupAnchor: [0, -18],
    });
  }
}

/** Local copy so the template doesn't need a pipe. */
function formatMeters(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} متر`;
  return `${(meters / 1000).toFixed(1)} كم`;
}
