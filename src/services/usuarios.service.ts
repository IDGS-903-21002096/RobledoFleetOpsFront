import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface Usuario {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  avatarKey: string;
  rolId: number;
  rolNombre: string;
  activo: boolean;
}

export interface CrearUsuarioRequest {
  nombre: string;
  apellidos: string;
  email: string;
  password: string;
  avatarKey: string;
  rolId: number;
}

export interface EditarUsuarioRequest {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  password?: string;
  avatarKey: string;
  rolId: number;
}

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Usuarios`;

  getUsuariosActivos(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl);
  }

  getUsuariosInactivos(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.apiUrl}/inactivos`);
  }

  getUsuarioById(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`);
  }

  crearUsuario(data: CrearUsuarioRequest): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  editarUsuario(data: EditarUsuarioRequest): Observable<any> {
    return this.http.put(this.apiUrl, data);
  }

  desactivarUsuario(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  reactivarUsuario(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/reactivar/${id}`, {});
  }
}