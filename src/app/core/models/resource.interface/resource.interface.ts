import { Component } from '@angular/core';

export interface Resource {
  _id: string;
  name: string;
  type: string;
  description: string;
  address: string;
  governorate: string;
  image?: string;
  status: 'available' | 'booked' | 'maintenance';
  organization?: {
    _id: string;
    name: string;
  };
}

@Component({
  selector: 'app-resource-interface', 
  standalone: true, 
  imports: [],
  templateUrl: './resource.interface.html',
  styleUrl: './resource.interface.css',
})
export class ResourceInterface {
}