import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { OrganizationService } from '../../core/Services/organization.service';
import { LocationService } from '../../core/Services/location.service';
import { AuthService } from '../../core/Services/auth.service';
import { DashboardService } from '../../core/Services/dashboard.service';
import { Booking, Category, Organization, UserDashboard } from '../../core/models/models';
import { MapMarker, MapView } from '../../shared/components/map-view/map-view';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, MapView],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private organizationService = inject(OrganizationService);
  private location = inject(LocationService);
  public auth = inject(AuthService);
  private dashboardService = inject(DashboardService);

  readonly categories = signal<Category[]>([]);
  readonly nearby = signal<Organization[]>([]);
  readonly summary = signal<UserDashboard | null>(null);
  readonly loading = signal(true);
  readonly locating = signal(false);
  readonly mapMarkers = signal<MapMarker[]>([]);

  /**
   * Upcoming bookings, hoisted out of the template. Under `strictTemplates`
   * an `@for` over `summary()?.bookings?.upcoming` won't narrow out `undefined`,
   * so the array has to be non-nullable at the call site.
   */
  readonly upcoming = computed<Booking[]>(() => this.summary()?.bookings.upcoming ?? []);

  readonly radius = 5000;
  readonly nearbyLimit = 12;

  get user() {
    return this.auth.currentUser();
  }

  get coords() {
    return this.location.coords();
  }

  /** Shown instead of the map when the user hasn't shared a location. */
  get needsLocation(): boolean {
    return this.auth.needsLocation() || !this.location.hasCoords();
  }

  ngOnInit(): void {
    this.loadSummary();
    this.loadContent();
  }

  private loadSummary(): void {
    this.dashboardService.user().subscribe({
      next: (res) => this.summary.set(res.data ?? null),
      error: () => this.summary.set(null),
    });
  }

  private loadContent(): void {
    const geo = this.geoOptions();

    this.organizationService.categories(geo).subscribe({
      next: (res) => this.categories.set(res.data?.categories ?? []),
      error: () => this.categories.set([]),
    });

    this.organizationService
      .nearby({
        lat: geo.lat ?? 30.0444,
        lng: geo.lng ?? 31.2357,
        distance: geo.distance ?? this.radius,
        limit: this.nearbyLimit,
      })
      .subscribe({
        next: (res) => {
          const list = res.data ?? [];
          this.nearby.set(list);
          this.mapMarkers.set(
            list
              .filter((org) => org.location?.coordinates)
              .map((org) => ({
                id: org._id,
                // GeoJSON is [lng, lat]; Leaflet wants (lat, lng).
                lat: org.location.coordinates[1],
                lng: org.location.coordinates[0],
                label: org.name,
                emoji: this.emojiFor(org.type),
              })),
          );
        },
        error: () => this.nearby.set([]),
        complete: () => this.loading.set(false),
      });
  }

  private geoOptions(): { lat?: number; lng?: number; distance?: number } {
    const coords = this.location.coords();
    if (!coords) return {};

    return {
      lat: coords.latitude,
      lng: coords.longitude,
      distance: this.user?.searchRadius ?? this.radius,
    };
  }

  askForLocation(): void {
    this.locating.set(true);

    this.location.request().subscribe((coords) => {
      this.locating.set(false);
      if (coords) this.loadContent();
    });
  }

  formatDistance(meters?: number | null): string {
    if (meters === null || meters === undefined) return '';
    if (meters < 1000) return `${Math.round(meters)} متر`;
    return `${(meters / 1000).toFixed(1)} كم`;
  }

  private emojiFor(type: string): string {
    const map: Record<string, string> = {
      hospital: '🏥',
      workspace: '💼',
      university: '🎓',
      school: '🏫',
      library: '📚',
      building: '🏢',
      government: '🏛️',
      company: '🏬',
      bank: '🏦',
      other: '📍',
    };
    return map[type] ?? '📍';
  }
}
