import { Component, HostListener } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cabecera',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './cabecera.html',
  styleUrl: './cabecera.scss',
})
export class CabeceraComponent {
  mobileMenuOpen = false;
  userMenuOpen = false;

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    if (this.mobileMenuOpen) this.userMenuOpen = false;
  }

  closeMobileMenu() {
    this.mobileMenuOpen = false;
  }

  toggleUserMenu() {
    this.userMenuOpen = !this.userMenuOpen;
    if (this.userMenuOpen) this.mobileMenuOpen = false;
  }

  closeUserMenu() {
    this.userMenuOpen = false;
  }

  // Cierra dropdown si das click fuera
  @HostListener('document:click')
  onDocClick() {
    this.userMenuOpen = false;
  }
}