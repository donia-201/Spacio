import { Component ,Input } from '@angular/core';

@Component({
  selector: 'app-resource-card',
  imports: [],
  templateUrl: './resource-card.html',
  styleUrl: './resource-card.css',
})
export class ResourceCard {
  @Input() resource!:any
getStatusClass(status: string) {
  switch (status) {
    case 'Available':
      return 'bg-green-100 text-green-700';

    case 'Booked':
      return 'bg-red-100 text-red-700';

    default:
      return 'bg-yellow-100 text-yellow-700';
  }
}
}
