import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { OrganizationService } from '../../core/Services/organization.service';
import { LocationService } from '../../core/Services/location.service';
import { AuthService } from '../../core/Services/auth.service';
import { Category } from '../../core/models/models';

interface NavLink {
  label: string;
  href: string;
}

interface Feature {
  icon: string;
  title: string;
  body: string;
}

interface Step {
  title: string;
  body: string;
}

/**
 * The single category photo per group. The brief asked for a photo per
 * category, but eight separate downloads is a lot of bytes for a landing
 * page, so nearby categories share one small, compressed image.
 */
const CATEGORY_IMAGES: Record<string, string> = {
  hospital: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=480&h=360&fit=crop&auto=format&q=55',
  workspace:
    'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=480&h=360&fit=crop&auto=format&q=55',
  university:
    'https://images.unsplash.com/photo-1562774053-701939374585?w=480&h=360&fit=crop&auto=format&q=55',
  school:
    'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=480&h=360&fit=crop&auto=format&q=55',
  library:
    'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=480&h=360&fit=crop&auto=format&q=55',
  building:
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=480&h=360&fit=crop&auto=format&q=55',
  government:
    'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=480&h=360&fit=crop&auto=format&q=55',
  company:
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=480&h=360&fit=crop&auto=format&q=55',
  bank: 'https://images.unsplash.com/photo-1541354329998-f4d54f2b1a1c?w=480&h=360&fit=crop&auto=format&q=55',
  other:
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=480&h=360&fit=crop&auto=format&q=55',
};

const CATEGORY_BLURB: Record<string, string> = {
  hospital: 'اعرف الأقرب ليك، عيادة المكان والخدمات المتاحة',
  workspace: 'مساحات عمل وجلسات ومكاتب جاهزة للحجز الفوري',
  university: 'قاعات محاضرات ومعامل ومكتبات جامعية قريبة منك',
  school: 'فصول ومعامل وأنشطة مدرسية متاحة للحجز',
  library: 'قاعات قراءة ودراسة ومساحات هدوء قريبة منك',
  building: 'قاعات اجتماعات ولوبيات ومساحات مشتركة',
  government: 'مكاتب خدمات وحجوزات رسمية في مكان واحد',
  company: 'قاعات اجتماعات ومساحات تدريب لفريقك',
  bank: 'شباك حجز وقاعات اجتماعات على الجنب',
  other: 'أماكن وخدمات متنوعة في محيطك القريب',
};

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './landing.html',
  styleUrl: './landing.css',
})
export class Landing implements OnInit {
  private organizationService = inject(OrganizationService);
  private location = inject(LocationService);
  public auth = inject(AuthService);
  private router = inject(Router);

  readonly navLinks: NavLink[] = [
    { label: 'الرئيسية', href: '#top' },
    { label: 'اكتشف', href: '#discover' },
    { label: 'الأماكن', href: '#discover' },
    { label: 'كيف نعمل؟', href: '#how' },
    { label: 'عن Spacio', href: '#about' },
  ];

  readonly features: Feature[] = [
    {
      icon: '◎',
      title: 'الأقرب ليك الأول',
      body: 'نرتّب الأماكن حسب موقعك الحقيقي، فاللي بتشوفه هو اللي يقدر توصله دلوقتي.',
    },
    {
      icon: '⚑',
      title: 'حجز في ثوانٍ',
      body: 'اختر المكان والوقت، والحجز بيتم تأكيد على طول من غير زحمة ولا أوراق.',
    },
    {
      icon: '◇',
      title: 'معلومات كاملة',
      body: 'العناوين وأوقات العمل والخدمات المتاحة، كل اللي تحتاجه قبل ما تروح.',
    },
    {
      icon: '⚙',
      title: 'إدارة وخدمة',
      body: 'المؤسسات والفنيين بيديروا أماكنهم من مكان واحد، والتحديثات بتبقى فورية.',
    },
  ];


  readonly steps: Step[] = [
    {
      title: 'اسمح بالموقع',
      body: 'أول حاجة بنطلبها الإذن بتحديد موقعك، وبكده نعرف نرتّبلك الأقرب.',
    },
    {
      title: 'اختار التصنيف',
      body: 'مستشفيات؟ مساحات عمل؟ مكتبات؟ اختار اللي انت محتاجه.',
    },
    {
      title: 'شوف الخيارات',
      body: 'داخل المكان هتلاقي كل الاختيارات المتاحة: عيادات، قاعات، معامل.',
    },
    {
      title: 'احجز على طول',
      body: 'اختار الوقت المناسب واحصل على تأكيد فوري على حسابك.',
    },
  ];

  readonly categories = signal<Category[]>([]);
  readonly loading = signal(true);
  readonly searchTerm = signal('');
  readonly usingMyLocation = signal(false);
  readonly locationNotice = signal('');
  readonly mobileMenuOpen = signal(false);

  ngOnInit(): void {
    this.loadCategories();
  }

  /**
   * The category grid is the product's whole premise, so it comes from the
   * API (which counts what's actually in the database) rather than being
   * hardcoded. Falls back to the static list if the API is down.
   */
  private loadCategories(): void {
    this.organizationService.categories(this.geoOptions()).subscribe({
      next: (res) => {
        const list = res.data?.categories ?? [];
        this.categories.set(list.length ? list : fallbackCategories());
        this.loading.set(false);
      },
      error: () => {
        this.categories.set(fallbackCategories());
        this.loading.set(false);
      },
    });
  }

  /** `categories()` only accepts these three keys, so build it explicitly. */
  private geoOptions(): { lat?: number; lng?: number; distance?: number } {
    const coords = this.location.coords();
    if (!coords) return {};

    return {
      lat: coords.latitude,
      lng: coords.longitude,
      distance: this.auth.currentUser()?.searchRadius ?? 5000,
    };
  }

  imageFor(key: string): string {
    return CATEGORY_IMAGES[key] ?? CATEGORY_IMAGES['other'];
  }

  blurbFor(key: string): string {
    return CATEGORY_BLURB[key] ?? CATEGORY_BLURB['other'];
  }

  /** Categories with something reachable, nearest first. */
  get nearbyCategories(): Category[] {
    return [...this.categories()]
      .filter((c) => (c.nearbyCount ?? c.total) > 0)
      .sort((a, b) => (a.nearestMeters ?? Infinity) - (b.nearestMeters ?? Infinity))
      .slice(0, 4);
  }

  onSearch(event: Event): void {
    event.preventDefault();
    const term = this.searchTerm().trim();
    this.router.navigate(['/home'], {
      queryParams: term ? { search: term } : {},
    });
  }

  /** The "موقعك الحالي" button in the search bar. */
  useMyLocation(): void {
    this.usingMyLocation.set(true);
    this.locationNotice.set('');

    this.location.request().subscribe((coords) => {
      this.usingMyLocation.set(false);

      if (!coords) {
        this.locationNotice.set(
          this.location.status() === 'denied'
            ? 'رفضت الإذن بالموقع. تقدر تفعّله من إعدادات المتصفح.'
            : 'مقدرناش نحدد موقعك دلوقتي.',
        );
        return;
      }

      this.locationNotice.set('تمام! رتّبنا الأماكن حسب موقعك.');
      this.loadCategories();
    });
  }

  formatDistance(meters: number | null): string {
    if (meters === null) return '';
    if (meters < 1000) return `${meters} م`;
    return `${(meters / 1000).toFixed(1)} كم`;
  }
}

/** Used when the API can't be reached, so the page is never empty. */
function fallbackCategories(): Category[] {
  return [
    ['hospital', 'مستشفيات', '🏥'],
    ['workspace', 'مساحات عمل', '💼'],
    ['university', 'جامعات', '🎓'],
    ['school', 'مدارس', '🏫'],
    ['library', 'مكتبات عامة', '📚'],
    ['building', 'مبانٍ ومساحات مشتركة', '🏢'],
    ['government', 'جهات حكومية', '🏛️'],
    ['company', 'شركات', '🏬'],
    ['bank', 'بنوك', '🏦'],
    ['other', 'أخرى', '📍'],
  ].map(([key, plural, icon]) => ({
    key: key as Category['key'],
    singular: plural as string,
    plural: plural as string,
    icon: icon as string,
    description: CATEGORY_BLURB[key as string] ?? '',
    options: [],
    total: 0,
    nearbyCount: 0,
    nearestMeters: null,
  }));
}
