import { EnvironmentProviders, Provider } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

/**
 * Every component in this app injects at least `HttpClient` and most inject
 * `Router`, so a bare `TestBed.configureTestingModule({ imports: [X] })`
 * fails at `createComponent`. This is the shared baseline.
 */
export function withAppTestDeps(): Array<Provider | EnvironmentProviders> {
  return [
    provideHttpClient(),
    provideHttpClientTesting(),
    provideRouter([]),
  ];
}
