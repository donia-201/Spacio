import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { AuthService } from './auth.services';
import { AuthService as CanonicalAuthService } from '../auth.service';

describe('AuthService (legacy path)', () => {
  it('re-exports the canonical service rather than defining a second one', () => {
    expect(AuthService).toBe(CanonicalAuthService);
  });

  it('can be injected', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    expect(TestBed.inject(AuthService)).toBeInstanceOf(AuthService);
  });
});
