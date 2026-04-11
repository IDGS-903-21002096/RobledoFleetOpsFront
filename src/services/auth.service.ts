import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../environments/environment';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UsuarioAutenticado {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  avatarKey: string;
  rolId: number;
  rolNombre: string;
  permisos: string[];
}

export interface LoginResponse {
  mensaje: string;
  token: string;
  usuario: UsuarioAutenticado;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Auth`;

  login(data: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, data).pipe(
      tap((response) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('usuario', JSON.stringify(response.usuario));
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getUsuario(): UsuarioAutenticado | null {
    const raw = localStorage.getItem('usuario');
    if (!raw) return null;

    try {
      return JSON.parse(raw) as UsuarioAutenticado;
    } catch {
      return null;
    }
  }

  tienePermiso(permiso: string): boolean {
    const usuario = this.getUsuario();
    if (!usuario?.permisos?.length) return false;

    return usuario.permisos.some(p => p.toLowerCase() === permiso.toLowerCase());
  }
}