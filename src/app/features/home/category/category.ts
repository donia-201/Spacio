import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { OrganizationService } from '../../../core/Services/organization.service';
import { LocationService } from '../../../core/Services/location.service';
import { AuthService } from '../../../core/Services/auth.service';
import { Organization, OptionDetail } from '../../../core/models/models';
import { MapMarker, MapView } from '../../../shared/components/map-view/map-view';

/**
 * One screen for a category: the places in it, what each place offers, and
 * where they are. Tapping a place reveals its option chips inline rather
 * than pushing a second page, so the comparison stays on one screen.
 */
@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MapView],
  templateUrl: './category.html',
  styleUrl: './category.css',
})
export class Category implements OnInit {
  private organizationService = inject(OrganizationService);
  private location = inject(LocationService);
  public auth = inject(AuthService);
  private route = inject(ActivatedRoute);

  readonly categoryKey = signal('');
  readonly organizations = signal<Organization[]>([]);
  readonly options = signal<OptionDetail[]>([]);
  readonly mapMarkers = signal<MapMarker[]>([]);
  readonly selected = signal<Organization | null>(null);

  readonly searchTerm = signal('');
  readonly loading = signal(true);
  readonly error = signal('');

  /** Filtered client-side: the payload is one category, not a whole DB. */
  readonly visible = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) return this.organizations();

    return this.organizations().filter(
      (org) =>
        org.name?.toLowerCase().includes(term) ||
        org.address?.toLowerCase().includes(term) ||
        org.city?.toLowerCase().includes(term) ||
        org.governorate?.toLowerCase().includes(term),
    );
  });

  get title(): string {
    return this.organizations()[0]?.typeLabel ?? 'الأماكن';
  }

  get coords() {
    return this.location.coords();
  }

  ngOnInit(): void {
    const type = this.route.snapshot.paramMap.get('type')?.toLowerCase() ?? '';
    this.categoryKey.set(type);
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    const key = this.categoryKey();
    const coords = this.location.coords();

    this.organizationService
      .list({
        type: key,
        limit: 60,
        ...(coords
          ? {
              lat: coords.latitude,
              lng: coords.longitude,
              distance: this.auth.currentUser()?.searchRadius ?? 5000,
            }
          : {}),
      })
      .subscribe({
        next: (res) => {
          const list = res.data ?? [];
          this.organizations.set(list);
          this.options.set(list[0]?.options ?? []);
          this.mapMarkers.set(
            list
              .filter((org) => org.location?.coordinates)
              .map((org) => ({
                id: org._id,
                lat: org.location.coordinates[1],
                lng: org.location.coordinates[0],
                label: org.name,
                emoji: org.typeLabel?.[0] ?? '📍',
              })),
          );
          this.loading.set(false);
        },
        error: () => {
          this.error.set('مقدرناش نحمّل الأماكن دلوقتي. حاول تاني.');
          this.loading.set(false);
        },
      });
  }

  /** Selecting a place shows its option chips and pins it on the map. */
  select(org: Organization): void {
    this.selected.set(this.selected()?._id === org._id ? null : org);
  }

  isSelected(org: Organization): boolean {
    return this.selected()?._id === org._id;
  }

  formatDistance(meters?: number | null): string {
    if (meters === null || meters === undefined) return '';
    if (meters < 1000) return `${Math.round(meters)} متر`;
    return `${(meters / 1000).toFixed(1)} كم`;
  }
}
