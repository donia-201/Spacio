import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ResourceService } from '../../../app/core/Services/resource.service/resource.service';
import { BookingService } from '../../core/Services/booking.service/booking.service';
import { Resource } from '../../core/models/resource.interface/resource.interface';
import { ResourceCard } from '../../shared/components/resource-card/resource-card'; 

@Component({
  selector: 'app-home',
  standalone: true, 
  imports: [
    CommonModule,
    FormsModule,
    ResourceCard
  ],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {

  private resourceService = inject(ResourceService);
  private bookingService = inject(BookingService);

  resources: Resource[] = [];
  filteredResources: Resource[] = [];
  searchTerm = '';
  selectedType = '';
  showToast = false;
  toastMessage = '';

  ngOnInit() {
    this.getResources();
  }

  getResources() {
    this.resourceService
      .getResources()
      .subscribe({
        next: (res: any) => {
          console.log(' data that arrives to angular is :', res);
          const data = res?.data || res || [];
          this.resources = data;
          this.filteredResources = data;
        },
        error: (err) => {
          console.error('Error fetching resources:', err);
        }
      });
  }

filterResources() {
    this.filteredResources = this.resources.filter((r: any) => {
      const searchVal = this.searchTerm.trim().toLowerCase();
      const nameMatch = !searchVal || (r?.name && r.name.toLowerCase().includes(searchVal));

      const typeMatch = !this.selectedType || r?.type === this.selectedType;

      return nameMatch && typeMatch;
    });
  }

  bookResource(id: string) {
    this.bookingService
      .createBooking(id)
      .subscribe({
        next: () => {
          this.toastMessage = 'Booking request sent successfully';
          this.showToast = true;
          setTimeout(() => {
            this.showToast = false;
          }, 3000);
        },
        error: (err) => {
          console.error('Booking failed error:', err);
          this.toastMessage = 'Booking failed';
          this.showToast = true;
          setTimeout(() => {
            this.showToast = false;
          }, 3000);
        }
      });
  }
}