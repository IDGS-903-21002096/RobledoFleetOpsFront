import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface Rol {
  id: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
  esSistema: boolean;
  permisos: string[];
}

export interface PermisoCatalogoItem {
  code: string;
  label: string;
  help: string;
}

export interface CatalogoPermisos {
  key: string;
  titulo: string;
  descripcion: string;
  permisos: PermisoCatalogoItem[];
}

export interface GuardarRolRequest {
  id?: number | null;
  nombre: string;
  descripcion: string;
  activo: boolean;
  permisos: string[];
}

@Injectable({
  providedIn: 'root'
})
export class RolesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Roles`;

  getRoles(): Observable<Rol[]> {
    return this.http.get<Rol[]>(this.apiUrl);
  }

  getRolById(id: number): Observable<Rol> {
    return this.http.get<Rol>(`${this.apiUrl}/${id}`);
  }

  crearRol(data: GuardarRolRequest): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  editarRol(data: GuardarRolRequest): Observable<any> {
    return this.http.put(this.apiUrl, data);
  }

  toggleEstadoRol(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/toggle-estado/${id}`, {});
  }

  getCatalogoPermisos(): Observable<CatalogoPermisos[]> {
    return this.http.get<CatalogoPermisos[]>(`${this.apiUrl}/catalogo-permisos`);
  }
}