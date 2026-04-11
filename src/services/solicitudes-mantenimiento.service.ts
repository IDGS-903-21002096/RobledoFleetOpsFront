import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export type TipoServicioSolicitud = 'Preventivo' | 'Correctivo';
export type PrioridadSolicitud = 'Baja' | 'Media' | 'Alta' | 'Crítica';
export type EstadoSolicitud = 'Pendiente' | 'Aprobada' | 'En proceso' | 'Finalizada' | 'Rechazada' | 'Cancelada';

export interface SolicitudMantenimiento {
  id: number;
  folio: string;
  fechaSolicitud: string;
  vehiculoId: number;
  vehiculo: string;
  placa?: string | null;
  tipoServicio: TipoServicioSolicitud;
  prioridad: PrioridadSolicitud;
  kilometraje?: number | null;
  observaciones: string;
  solicitadoPorNombre?: string | null;
  usuarioSolicitanteId?: number | null;
  estado: EstadoSolicitud;
  mantenimientoId?: number | null;
}

export interface CrearSolicitudMantenimientoRequest {
  vehiculoId: number;
  tipoServicio: TipoServicioSolicitud;
  prioridad: PrioridadSolicitud;
  kilometraje?: number | null;
  observaciones: string;
  solicitadoPorNombre?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class SolicitudesMantenimientoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/SolicitudesMantenimiento`;

  getSolicitudes(): Observable<SolicitudMantenimiento[]> {
    return this.http.get<SolicitudMantenimiento[]>(this.apiUrl);
  }

  getSolicitudById(id: number): Observable<SolicitudMantenimiento> {
    return this.http.get<SolicitudMantenimiento>(`${this.apiUrl}/${id}`);
  }

  crearSolicitud(data: CrearSolicitudMantenimientoRequest): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  aprobarSolicitud(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/aprobar`, {});
  }

  rechazarSolicitud(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/rechazar`, {});
  }

  cancelarSolicitud(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/cancelar`, {});
  }
}