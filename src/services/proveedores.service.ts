import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface Proveedor {
  id: number;
  nombreComercial: string;
  tipo: string;
  telefono: string;
  email?: string | null;
  calle?: string | null;
  numero?: string | null;
  colonia?: string | null;
  ciudad?: string | null;
  estado?: string | null;
  cp?: string | null;
  contacto?: string | null;
  telefonoContacto?: string | null;
  correoContacto?: string | null;
  activo: boolean;
}

export interface CrearProveedorRequest {
  nombreComercial: string;
  tipo: string;
  telefono: string;
  email?: string | null;
  calle?: string | null;
  numero?: string | null;
  colonia?: string | null;
  ciudad?: string | null;
  estado?: string | null;
  cp?: string | null;
  contacto?: string | null;
  telefonoContacto?: string | null;
  correoContacto?: string | null;
}

export interface EditarProveedorRequest extends CrearProveedorRequest {
  id: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProveedoresService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Proveedores`;

  getProveedoresActivos(): Observable<Proveedor[]> {
    return this.http.get<Proveedor[]>(this.apiUrl);
  }

  getProveedoresInactivos(): Observable<Proveedor[]> {
    return this.http.get<Proveedor[]>(`${this.apiUrl}/inactivos`);
  }

  getProveedorById(id: number): Observable<Proveedor> {
    return this.http.get<Proveedor>(`${this.apiUrl}/${id}`);
  }

  crearProveedor(data: CrearProveedorRequest): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  editarProveedor(data: EditarProveedorRequest): Observable<any> {
    return this.http.put(this.apiUrl, data);
  }

  inactivarProveedor(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  reactivarProveedor(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/reactivar/${id}`, {});
  }
}