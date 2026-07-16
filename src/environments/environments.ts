import { Component } from '@angular/core';

@Component({
  selector: 'app-environments',
  imports: [],
  templateUrl: './environments.html',
  styleUrl: './environments.css',
})
export class Environments {}
export const environment = {
  apiUrl: 'http://localhost:3000',
};
