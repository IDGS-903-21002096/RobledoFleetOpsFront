import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export type TipoEntrada =
  | 'COMPRA'
  | 'DEVOLUCIÓN'
  | 'INVENTARIO INICIAL'
  | 'AJUSTE POSITIVO';

export interface EntradaInventario {
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
  proveedorId?: number | null;
  proveedor?: string | null; // aquí ya puede venir catálogo o manual
  tipoEntrada: TipoEntrada;
  referencia?: string | null;
  observaciones?: string | null;
  usuario?: string | null;
  activo: boolean;
}

export interface EntradasResumen {
  totalEntradas: number;
  cantidadTotalIngresada: number;
  costoTotalEntradas: number;
}

export interface CrearEntradaInventarioRequest {
  fecha: string;
  articuloInventarioId: number;
  cantidad: number;
  costoUnitario: number;

  // 🔥 clave del ajuste
  proveedorId?: number | null;
  proveedorNombreManual?: string | null;

  tipoEntrada: TipoEntrada;
  referencia?: string | null;
  observaciones?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class EntradasInventarioService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/EntradasInventario`;

  getEntradas(busqueda?: string, tipo?: string): Observable<EntradaInventario[]> {
    let params = new HttpParams();

    if (busqueda?.trim()) {
      params = params.set('busqueda', busqueda.trim());
    }

    if (tipo?.trim()) {
      params = params.set('tipo', tipo.trim());
    }

    return this.http.get<EntradaInventario[]>(this.apiUrl, { params });
  }

  getEntradaById(id: number): Observable<EntradaInventario> {
    return this.http.get<EntradaInventario>(`${this.apiUrl}/${id}`);
  }

  getResumen(busqueda?: string, tipo?: string): Observable<EntradasResumen> {
    let params = new HttpParams();

    if (busqueda?.trim()) {
      params = params.set('busqueda', busqueda.trim());
    }

    if (tipo?.trim()) {
      params = params.set('tipo', tipo.trim());
    }

    return this.http.get<EntradasResumen>(`${this.apiUrl}/resumen`, { params });
  }

  crearEntrada(data: CrearEntradaInventarioRequest): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  eliminarEntrada(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}