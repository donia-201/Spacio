import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { StatusPipe } from '../../pipes/status-pipe';



@Component({
  selector: 'app-resource-card',
  standalone: true, 
  imports: [CommonModule , StatusPipe],
  templateUrl: './resource-card.html',
  styleUrl: './resource-card.css'
})
export class ResourceCard {

  @Input() resource: any;

  @Output() book = new EventEmitter<string>();

  bookNow() {
    if (this.resource && this.resource._id) {
      this.book.emit(this.resource._id);
    }
  }
}