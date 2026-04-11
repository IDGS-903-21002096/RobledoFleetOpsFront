import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
})
export class LoginComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  email = '';
  password = '';
  aceptaTerminos = false;

  loading = false;
  errorMessage = '';

  onLogin(): void {
    this.errorMessage = '';

    if (!this.email.trim() || !this.password.trim()) {
      this.errorMessage = 'Captura el correo y la contraseña.';
      return;
    }

    if (!this.aceptaTerminos) {
      this.errorMessage = 'Debes aceptar los términos y condiciones.';
      return;
    }

    this.loading = true;

    this.authService.login({
      email: this.email.trim(),
      password: this.password
    }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/inicio']);
      },
      error: (error) => {
        console.error('Error al iniciar sesión:', error);
        this.errorMessage =
          error?.error?.mensaje ||
          error?.error?.message ||
          'Correo o contraseña incorrectos.';
        this.loading = false;
      }
    });
  }
}