import { Component } from '@angular/core';

@Component({
  selector: 'app-user.interface',
  imports: [],
  templateUrl: './user.interface.html',
  styleUrl: './user.interface.css',
})
export class UserInterface {}
export interface User {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  phone?: string;
  governorate?: string;
}
