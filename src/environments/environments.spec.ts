import { environment } from './environments';

describe('environment', () => {
  it('exposes the API base url', () => {
    expect(environment.apiUrl).toBeTruthy();
  });
});
