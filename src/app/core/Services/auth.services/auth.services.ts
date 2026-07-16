import { Component } from '@angular/core';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../../environments/environments';
import { User } from '../../../shared/interfaces/user.interface/user.interface';

@Component({
  selector: 'app-auth.services',
  imports: [],
  templateUrl: './auth.services.html',
  styleUrl: './auth.services.css',
})


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl =
    `${environment.apiUrl}/auth`;

  private currentUserSubject =
    new BehaviorSubject<User | null>(null);

  currentUser$ =
    this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient
  ) {}

  register(
    data: any
  ): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/signup`,
      data
    );
  }

  login(
    data: any
  ): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/login`,
      data
    );
  }


  saveToken(
    token: string
  ) {
    localStorage.setItem(
      'token',
      token
    );
  }

  getToken() {
    return localStorage.getItem(
      'token'
    );
  }

  logout() {
    localStorage.removeItem(
      'token'
    );

    this.currentUserSubject.next(
      null
    );
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  setCurrentUser(
    user: User
  ) {
    this.currentUserSubject.next(
      user
    );
  }
}
