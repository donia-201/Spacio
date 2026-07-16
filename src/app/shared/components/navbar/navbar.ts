import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common'; 
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterLink, 
    RouterLinkActive, 
    CommonModule 
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  // isMenuOpen = false;

  // toggleMenu(event: Event) {
  //   event.stopPropagation(); 
  //       this.isMenuOpen = !this.isMenuOpen;
  //       console.log('Menu status is now:', this.isMenuOpen);
  //      }

  // closeMenu() {
  //   this.isMenuOpen = false;
 // }
}