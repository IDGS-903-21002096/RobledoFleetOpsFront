import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface DetalleMantenimientoRequest {
  articuloInventarioId: number;
  cantidad: number;
  precioUnitarioAplicado: number;
}

export interface CrearMantenimientoRequest {
  fecha: string;
  fechaSiguienteMantenimiento: string;
  horasTecnico?: number | null;
  vehiculoId: number;
  tipoServicio: string;
  kilometraje: number;
  estatus: string;
  nivelServicio: string;
  tecnicosTexto: string;
  observaciones?: string | null;
  origenMantenimiento: string;
  solicitudMantenimientoId?: number | null;

  revisionNiveles: boolean;
  limpiezaAjusteFrenos: boolean;
  engrasado: boolean;
  revisionLuces: boolean;
  revisionSuspension: boolean;
  revisionCarroceria: boolean;
  revisionSistemaElectrico: boolean;
  checklistOtro: boolean;
  checklistOtroTexto?: string | null;

  manoObra: number;
  detalles: DetalleMantenimientoRequest[];
}

export interface MantenimientoDetalleItem {
  id: number;
  articuloInventarioId: number;
  articuloNombre: string;
  unidad: string;
  cantidad: number;
  precioUnitarioAplicado: number;
  subtotal: number;
}

export interface MantenimientoDetalle {
  id: number;
  noOrden?: string | null;
  fecha: string;
  fechaSiguienteMantenimiento: string;
  horasTecnico?: number | null;
  vehiculoId: number;
  unidad: string;
  tipoServicio: string;
  kilometraje: number;
  estatus: string;
  nivelServicio: string;
  tecnicosTexto: string;
  observaciones?: string | null;
  origenMantenimiento: string;
  solicitudMantenimientoId?: number | null;

  revisionNiveles: boolean;
  limpiezaAjusteFrenos: boolean;
  engrasado: boolean;
  revisionLuces: boolean;
  revisionSuspension: boolean;
  revisionCarroceria: boolean;
  revisionSistemaElectrico: boolean;
  checklistOtro: boolean;
  checklistOtroTexto?: string | null;

  manoObra: number;
  totalMateriales: number;
  totalFinalServicio: number;

  detalles: MantenimientoDetalleItem[];
}

@Injectable({
  providedIn: 'root'
})
export class MantenimientosService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Mantenimientos`;

  getMantenimientos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getMantenimientoById(id: number): Observable<MantenimientoDetalle> {
    return this.http.get<MantenimientoDetalle>(`${this.apiUrl}/${id}`);
  }

  crearMantenimiento(data: CrearMantenimientoRequest): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  actualizarMantenimiento(id: number, data: CrearMantenimientoRequest): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  cerrarMantenimiento(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/cerrar`, {});
  }

  eliminarMantenimiento(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getRecordatorios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/recordatorios`);
  }
}