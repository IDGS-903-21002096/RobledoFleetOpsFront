import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface ArticuloInventario {
  id: number;
  codigo: string;
  nombre: string;
  modelo?: string | null;
  puntoReorden?: number | null;
  descripcion?: string | null;
  unidad: string;
  grupoInventarioId: number;
  grupo: string;
  proveedorId?: number | null;
  proveedor?: string | null;
  existencia: number;
  costoPromedio: number;
  activo: boolean;
}

export interface CrearArticuloInventarioRequest {
  codigo: string;
  nombre: string;
  modelo?: string | null;
  puntoReorden?: number | null;
  descripcion?: string | null;
  unidad: string;
  grupoInventarioId: number;
}

export interface EditarArticuloInventarioRequest extends CrearArticuloInventarioRequest {
  id: number;
}

export interface CrearArticuloInventarioMultipleRequest {
  articulos: CrearArticuloInventarioRequest[];
}

@Injectable({
  providedIn: 'root'
})
export class ArticulosInventarioService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/ArticulosInventario`;

  getArticulosActivos(): Observable<ArticuloInventario[]> {
    return this.http.get<ArticuloInventario[]>(this.apiUrl);
  }

  getArticulosInactivos(): Observable<ArticuloInventario[]> {
    return this.http.get<ArticuloInventario[]>(`${this.apiUrl}/inactivos`);
  }

  getArticuloById(id: number): Observable<ArticuloInventario> {
    return this.http.get<ArticuloInventario>(`${this.apiUrl}/${id}`);
  }

  crearArticulo(data: CrearArticuloInventarioRequest): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  crearArticulosMultiples(data: CrearArticuloInventarioMultipleRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/multiple`, data);
  }

  editarArticulo(data: EditarArticuloInventarioRequest): Observable<any> {
    return this.http.put(this.apiUrl, data);
  }

  inactivarArticulo(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  reactivarArticulo(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/reactivar/${id}`, {});
  }
}