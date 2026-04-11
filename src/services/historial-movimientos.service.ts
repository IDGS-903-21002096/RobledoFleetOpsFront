import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export type TipoMovimiento = 'ENTRADA' | 'SALIDA';

export interface MovimientoInventario {
  folio: string;
  fecha: string;
  tipo: TipoMovimiento;
  detalleTipo: string;
  articuloInventarioId: number;
  codigoArticulo: string;
  articulo: string;
  grupo: string;
  unidad: string;
  cantidad: number;
  costoUnitario: number;
  costoTotal: number;
  proveedor?: string | null;
  responsable?: string | null;
  referencia?: string | null;
  observaciones?: string | null;
  usuario?: string | null;
}

export interface HistorialMovimientosResumen {
  totalMovimientos: number;
  totalEntradas: number;
  totalSalidas: number;
  valorTotalMovido: number;
}

@Injectable({
  providedIn: 'root'
})
export class HistorialMovimientosService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/HistorialMovimientos`;

  getMovimientos(filters?: {
    busqueda?: string;
    tipo?: string;
    grupo?: string;
    fechaDesde?: string;
    fechaHasta?: string;
  }): Observable<MovimientoInventario[]> {
    let params = new HttpParams();

    if (filters?.busqueda?.trim()) {
      params = params.set('busqueda', filters.busqueda.trim());
    }

    if (filters?.tipo?.trim()) {
      params = params.set('tipo', filters.tipo.trim());
    }

    if (filters?.grupo?.trim()) {
      params = params.set('grupo', filters.grupo.trim());
    }

    if (filters?.fechaDesde?.trim()) {
      params = params.set('fechaDesde', filters.fechaDesde.trim());
    }

    if (filters?.fechaHasta?.trim()) {
      params = params.set('fechaHasta', filters.fechaHasta.trim());
    }

    return this.http.get<MovimientoInventario[]>(this.apiUrl, { params });
  }

  getResumen(filters?: {
    busqueda?: string;
    tipo?: string;
    grupo?: string;
    fechaDesde?: string;
    fechaHasta?: string;
  }): Observable<HistorialMovimientosResumen> {
    let params = new HttpParams();

    if (filters?.busqueda?.trim()) {
      params = params.set('busqueda', filters.busqueda.trim());
    }

    if (filters?.tipo?.trim()) {
      params = params.set('tipo', filters.tipo.trim());
    }

    if (filters?.grupo?.trim()) {
      params = params.set('grupo', filters.grupo.trim());
    }

    if (filters?.fechaDesde?.trim()) {
      params = params.set('fechaDesde', filters.fechaDesde.trim());
    }

    if (filters?.fechaHasta?.trim()) {
      params = params.set('fechaHasta', filters.fechaHasta.trim());
    }

    return this.http.get<HistorialMovimientosResumen>(`${this.apiUrl}/resumen`, { params });
  }
}