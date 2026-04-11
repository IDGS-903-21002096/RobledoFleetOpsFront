import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface GrupoInventario {
  id: number;
  nombre: string;
  activo: boolean;
}

export interface CrearGrupoInventarioRequest {
  nombre: string;
}

export interface EditarGrupoInventarioRequest {
  id: number;
  nombre: string;
}

@Injectable({
  providedIn: 'root'
})
export class GruposInventarioService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/GruposInventario`;

  getGruposActivos(): Observable<GrupoInventario[]> {
    return this.http.get<GrupoInventario[]>(this.apiUrl);
  }

  getGruposInactivos(): Observable<GrupoInventario[]> {
    return this.http.get<GrupoInventario[]>(`${this.apiUrl}/inactivos`);
  }

  getGrupoById(id: number): Observable<GrupoInventario> {
    return this.http.get<GrupoInventario>(`${this.apiUrl}/${id}`);
  }

  crearGrupo(data: CrearGrupoInventarioRequest): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  editarGrupo(data: EditarGrupoInventarioRequest): Observable<any> {
    return this.http.put(this.apiUrl, data);
  }

  inactivarGrupo(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  reactivarGrupo(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/reactivar/${id}`, {});
  }
}