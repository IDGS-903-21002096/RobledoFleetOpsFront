import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { CabeceraComponent } from '../../../components/cabecera/cabecera';
import { FooterComponent } from '../../../components/footer/footer';

type AvatarOption = {
  key: string;
  url: string;
};

type RegistroUsuarioModel = {
  nombre: string;
  apellidos: string;
  email: string;
  rol: string;
  password: string;
  avatarKey: string;
};

@Component({
  selector: 'app-registro-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CabeceraComponent, FooterComponent],
  templateUrl: './registro-usuario.html',
})
export class RegistroUsuarioComponent {
  model: RegistroUsuarioModel = {
    nombre: '',
    apellidos: '',
    email: '',
    rol: '',
    password: '',
    avatarKey: '',
  };

  roles: string[] = [
    'Administrador (Gerencia)',
    'Administrador (Sin roles)',
    'Monitoreo (Solo consulta)',
    'Supervisores (Solo consulta)',
  ];

  avatars: AvatarOption[] = [
  { key: 'av1', url: 'assets/avatars/av1.jpg' },
  { key: 'av2', url: 'assets/avatars/av2.png' },
  ];


  // ====== touched flags (validación visual) ======
  nombreTouched = false;
  apellidosTouched = false;
  emailTouched = false;
  rolTouched = false;
  avatarTouched = false;
  passwordTouched = false;

  constructor(private router: Router) {}

  // Preview del avatar seleccionado
  get selectedAvatarUrl(): string | null {
    const found = this.avatars.find((a) => a.key === this.model.avatarKey);
    return found ? found.url : null;
  }

  selectAvatar(a: AvatarOption): void {
    this.model.avatarKey = a.key;
    this.avatarTouched = true;
  }

  // ====== Validadores ======
  isValidNombre(v: string): boolean {
    return (v ?? '').trim().length > 0;
  }

  isValidApellidos(v: string): boolean {
    return (v ?? '').trim().length > 0;
  }

  isValidEmail(email: string): boolean {
    const value = (email ?? '').trim();
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(value);
  }

  isValidRol(v: string): boolean {
    return (v ?? '').trim().length > 0;
  }

  isValidAvatar(): boolean {
    return (this.model.avatarKey ?? '').trim().length > 0;
  }

  // Regla: mínimo 8, 1 mayúscula, 1 número
  isValidPassword(v: string): boolean {
    const value = (v ?? '').trim();
    const minLen = value.length >= 8;
    const hasUpper = /[A-Z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    return minLen && hasUpper && hasNumber;
  }

  onCancelar(): void {
    this.router.navigate(['/usuarios']);
  }

  onGuardar(): void {
    // Al intentar guardar, activamos la validación visual en todo
    this.nombreTouched = true;
    this.apellidosTouched = true;
    this.emailTouched = true;
    this.rolTouched = true;
    this.avatarTouched = true;
    this.passwordTouched = true;

    const ok =
      this.isValidNombre(this.model.nombre) &&
      this.isValidApellidos(this.model.apellidos) &&
      this.isValidEmail(this.model.email) &&
      this.isValidRol(this.model.rol) &&
      this.isValidAvatar() &&
      this.isValidPassword(this.model.password);

    if (!ok) return;

    console.log('Usuario a guardar:', this.model);
    this.router.navigate(['/usuarios']);
  }
}
