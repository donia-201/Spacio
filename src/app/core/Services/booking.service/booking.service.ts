import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BookingService {

  private http = inject(HttpClient);

  baseUrl = 'http://localhost:3000/bookings';

  createBooking(resourceId: string): Observable<any> {
    return this.http.post(
      this.baseUrl,
      {
        resource: resourceId
      }
    );
  }
}