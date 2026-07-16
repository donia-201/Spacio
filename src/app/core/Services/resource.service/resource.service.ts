import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ResourceService {

  private http = inject(HttpClient);

  baseUrl = 'http://localhost:3000/resources';

  getResources(): Observable<any> {
    return this.http.get(this.baseUrl);
  }

  getResourceById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }
}