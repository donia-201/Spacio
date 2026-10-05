import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { ResourceService } from './resource.service';
import { ResourceService as CanonicalResourceService } from '../resource.service';

describe('ResourceService (legacy path)', () => {
  it('re-exports the canonical service', () => {
    expect(ResourceService).toBe(CanonicalResourceService);
  });

  it('can be injected', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    expect(TestBed.inject(ResourceService)).toBeInstanceOf(ResourceService);
  });
});
