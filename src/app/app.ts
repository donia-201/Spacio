import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { AuthService } from './core/Services/auth.service';
import { LocationService } from './core/Services/location.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet />',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class App {
  private auth = inject(AuthService);
  private location = inject(LocationService);

  constructor() {
    if (this.auth.hasToken()) {
      // The role guards read the stored user, so it has to be current.
      // Silently try the browser's remembered position too — no second prompt.
      this.auth.refreshProfile().subscribe();
      this.location.request(true).subscribe();
    }
  }
}
