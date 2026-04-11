import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface TipoVehiculo {
  id: number;
  nombre: string;
  descripcion: string;
  enUso: number;
  activo: boolean;
}

export interface GuardarTipoVehiculoRequest {
  id?: number | null;
  nombre: string;
  descripcion: string;
  activo: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TiposVehiculoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/TiposVehiculo`;

  getTipos(): Observable<TipoVehiculo[]> {
    return this.http.get<TipoVehiculo[]>(this.apiUrl);
  }

  getTiposActivos(): Observable<TipoVehiculo[]> {
    return this.http.get<TipoVehiculo[]>(`${this.apiUrl}/activos`);
  }

  getTiposInactivos(): Observable<TipoVehiculo[]> {
    return this.http.get<TipoVehiculo[]>(`${this.apiUrl}/inactivos`);
  }

  getTipoById(id: number): Observable<TipoVehiculo> {
    return this.http.get<TipoVehiculo>(`${this.apiUrl}/${id}`);
  }

  crearTipo(data: GuardarTipoVehiculoRequest): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  editarTipo(data: GuardarTipoVehiculoRequest): Observable<any> {
    return this.http.put(this.apiUrl, data);
  }

  inactivarTipo(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  reactivarTipo(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/reactivar/${id}`, {});
  }
}