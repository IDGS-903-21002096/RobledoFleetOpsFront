import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export type MotivoSalida =
  | 'DAÑO'
  | 'MERMA'
  | 'BAJA'
  | 'PÉRDIDA'
  | 'CONSUMO INTERNO'
  | 'AJUSTE NEGATIVO'
  | 'MANTENIMIENTO';

export interface SalidaInventario {
  id: number;
  folio: string;
  fecha: string;
  articuloInventarioId: number;
  codigoArticulo: string;
  articulo: string;
  grupo: string;
  unidad: string;
  cantidad: number;
  costoUnitario: number;
  costoTotal: number;
  motivo: MotivoSalida;
  referencia?: string | null;
  observaciones?: string | null;
  usuario?: string | null;
  responsable?: string | null;
  activo: boolean;
}

export interface SalidasResumen {
  totalSalidas: number;
  cantidadTotalSalida: number;
  costoTotalSalidas: number;
}

export interface CrearSalidaInventarioRequest {
  fecha: string;
  articuloInventarioId: number;
  cantidad: number;
  costoUnitario: number;
  motivo: MotivoSalida;
  referencia?: string | null;
  observaciones?: string | null;
  usuario?: string | null;
  responsable?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class SalidasInventarioService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/SalidasInventario`;

  getSalidas(busqueda?: string, motivo?: string): Observable<SalidaInventario[]> {
    let params = new HttpParams();

    if (busqueda?.trim()) {
      params = params.set('busqueda', busqueda.trim());
    }

    if (motivo?.trim()) {
      params = params.set('motivo', motivo.trim());
    }

    return this.http.get<SalidaInventario[]>(this.apiUrl, { params });
  }

  getSalidaById(id: number): Observable<SalidaInventario> {
    return this.http.get<SalidaInventario>(`${this.apiUrl}/${id}`);
  }

  getResumen(busqueda?: string, motivo?: string): Observable<SalidasResumen> {
    let params = new HttpParams();

    if (busqueda?.trim()) {
      params = params.set('busqueda', busqueda.trim());
    }

    if (motivo?.trim()) {
      params = params.set('motivo', motivo.trim());
    }

    return this.http.get<SalidasResumen>(`${this.apiUrl}/resumen`, { params });
  }

  crearSalida(data: CrearSalidaInventarioRequest): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  eliminarSalida(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}