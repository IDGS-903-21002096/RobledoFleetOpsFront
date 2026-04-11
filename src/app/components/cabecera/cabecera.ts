import { Component, HostListener, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService, UsuarioAutenticado } from '../../../services/auth.service';

@Component({
  selector: 'app-cabecera',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './cabecera.html',
  styleUrl: './cabecera.scss',
})
export class CabeceraComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  mobileMenuOpen = false;
  userMenuOpen = false;

  usuario: UsuarioAutenticado | null = this.authService.getUsuario();

  get nombreUsuario(): string {
    if (!this.usuario) return 'Usuario';
    return `${this.usuario.nombre} ${this.usuario.apellidos}`.trim();
  }

  get emailUsuario(): string {
    return this.usuario?.email ?? 'usuario@robledo.com';
  }

  get avatarUsuario(): string {
    const avatarKey = this.usuario?.avatarKey?.trim()?.toLowerCase();

    switch (avatarKey) {
      case 'av1':
        return 'assets/avatars/av1.jpg';
      case 'av2':
        return 'assets/avatars/av2.png';
      default:
        return 'assets/avatars/av2.png';
    }
  }

  onAvatarError(event: Event): void {
    const img = event.target as HTMLImageElement;

    if (img.dataset['fallbackApplied'] === 'true') return;

    img.dataset['fallbackApplied'] = 'true';
    img.src = 'assets/avatars/av2.png';
  }

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

  onLogout() {
    this.closeUserMenu();
    this.closeMobileMenu();
    this.authService.logout();
    this.router.navigate(['/']);
  }

  @HostListener('document:click')
  onDocClick() {
    this.userMenuOpen = false;
  }
}