import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface Vehiculo {
  id: number;
  nombreVehiculo: string;
  marca: string;
  modelo: string;
  anio: number;
  tipoVehiculoId: number;
  tipoVehiculo: string;
  statusInicial: string;
  inicioEstadisticas: string;
  medidaUso: string;
  medidaCombustible: string;
  grupo?: string | null;
  division?: string | null;
  numeroSerie?: string | null;
  placa?: string | null;
  color?: string | null;
  companiaSeguros?: string | null;
  polizaSeguro?: string | null;
  activo: boolean;
}

export interface CrearVehiculoRequest {
  nombreVehiculo: string;
  marca: string;
  modelo: string;
  anio: number;
  tipoVehiculoId: number;
  statusInicial: string;
  inicioEstadisticas: string;
  medidaUso: string;
  medidaCombustible: string;
  grupo?: string | null;
  division?: string | null;
  numeroSerie?: string | null;
  placa?: string | null;
  color?: string | null;
  companiaSeguros?: string | null;
  polizaSeguro?: string | null;
}

export interface EditarVehiculoRequest extends CrearVehiculoRequest {
  id: number;
  activo: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class VehiculosService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Vehiculos`;

  getVehiculos(): Observable<Vehiculo[]> {
    return this.http.get<Vehiculo[]>(this.apiUrl);
  }

  getVehiculosActivos(): Observable<Vehiculo[]> {
    return this.http.get<Vehiculo[]>(`${this.apiUrl}/activos`);
  }

  getVehiculosInactivos(): Observable<Vehiculo[]> {
    return this.http.get<Vehiculo[]>(`${this.apiUrl}/inactivos`);
  }

  getVehiculoById(id: number): Observable<Vehiculo> {
    return this.http.get<Vehiculo>(`${this.apiUrl}/${id}`);
  }

  crearVehiculo(data: CrearVehiculoRequest): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  editarVehiculo(data: EditarVehiculoRequest): Observable<any> {
    return this.http.put(this.apiUrl, data);
  }

  inactivarVehiculo(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  reactivarVehiculo(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/reactivar/${id}`, {});
  }
}