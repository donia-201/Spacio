import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { BookingService } from './booking.service';
import { BookingService as CanonicalBookingService } from '../booking.service';

describe('BookingService (legacy path)', () => {
  it('re-exports the canonical service', () => {
    expect(BookingService).toBe(CanonicalBookingService);
  });

  it('can be injected', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    expect(TestBed.inject(BookingService)).toBeInstanceOf(BookingService);
  });
});
