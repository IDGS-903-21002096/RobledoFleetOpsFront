import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { CabeceraComponent } from '../../../components/cabecera/cabecera';
import { FooterComponent } from '../../../components/footer/footer';

import {
  EstadoSolicitud,
  PrioridadSolicitud,
  SolicitudMantenimiento,
  SolicitudesMantenimientoService
} from '../../../../services/solicitudes-mantenimiento.service';

type SolicitudMantenimientoView = {
  id: number;
  folio: string;
  fechaSolicitud: string;
  unidadNombre: string;
  placa?: string | null;
  tipoServicio: string;
  prioridad: PrioridadSolicitud;
  kilometraje: number | null;
  observaciones: string;
  solicitadoPor: string;
  estado: EstadoSolicitud;
};

@Component({
  selector: 'app-solicitudes-mantenimiento',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CabeceraComponent, FooterComponent],
  templateUrl: './solicitudes-mantenimiento.html',
})
export class SolicitudesMantenimientoComponent implements OnInit {
  private router = inject(Router);
  private solicitudesService = inject(SolicitudesMantenimientoService);

  solicitudes: SolicitudMantenimientoView[] = [];
  solicitudesFiltradas: SolicitudMantenimientoView[] = [];
  solicitudesPaginadas: SolicitudMantenimientoView[] = [];

  search = '';
  filtroEstado = '';
  filtroPrioridad = '';

  page = 1;
  pageSize = 5;

  loading = false;
  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    this.cargarSolicitudes();
  }

  cargarSolicitudes(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.solicitudesService.getSolicitudes().subscribe({
      next: (data) => {
        this.solicitudes = (data ?? []).map((s) => this.mapSolicitud(s as any));
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar solicitudes:', error);
        this.errorMessage = this.getLoadErrorMessage(error, 'las solicitudes de mantenimiento');
        this.solicitudes = [];
        this.solicitudesFiltradas = [];
        this.solicitudesPaginadas = [];
        this.loading = false;
      }
    });
  }

  private getLoadErrorMessage(error: any, recurso: string): string {
    const status = error?.status;

    if (status === 403) {
      return `Tu rol no tiene acceso a ${recurso}.`;
    }

    if (status === 401) {
      return 'Tu sesión no es válida o ha expirado. Inicia sesión nuevamente.';
    }

    if (status === 0) {
      return 'No fue posible conectar con el servidor.';
    }

    return `No se pudo cargar ${recurso}.`;
  }

  private mapSolicitud(s: any): SolicitudMantenimientoView {
    const vehiculoId = this.pickNumber(
      s?.vehiculoId,
      s?.unidadId,
      s?.idVehiculo
    );

    const unidadNombre =
      this.pickString(
        s?.vehiculo,
        s?.vehiculoNombre,
        s?.unidadNombre,
        s?.unidad,
        s?.numeroEconomico,
        s?.noEconomico,
        s?.vehiculoCodigo
      ) ||
      (vehiculoId !== null ? `Unidad ${vehiculoId}` : 'Sin unidad');

    const solicitadoPor =
      this.pickString(
        s?.solicitadoPorNombre,
        s?.solicitadoPor,
        s?.usuarioSolicitanteNombre,
        s?.usuarioNombre,
        s?.nombreUsuario,
        s?.creadoPor,
        s?.usuario
      ) || '—';

    return {
      id: Number(s?.id ?? 0),
      folio: this.pickString(s?.folio) || '—',
      fechaSolicitud: this.formatFechaSolo(s?.fechaSolicitud ?? s?.fecha ?? s?.createdAt),
      unidadNombre,
      placa: this.pickString(s?.placa) || null,
      tipoServicio: this.pickString(s?.tipoServicio) || '—',
      prioridad: (this.pickString(s?.prioridad) as PrioridadSolicitud) || 'Baja',
      kilometraje: this.pickNumber(s?.kilometraje),
      observaciones: this.pickString(s?.observaciones) || '',
      solicitadoPor,
      estado: (this.pickString(s?.estado) as EstadoSolicitud) || 'Pendiente',
    };
  }

  private formatFechaSolo(value: unknown): string {
    if (!value) return '—';

    const fecha = String(value).trim();
    if (!fecha) return '—';

    if (fecha.includes('T')) {
      return fecha.split('T')[0];
    }

    const match = fecha.match(/^(\d{4}-\d{2}-\d{2})/);
    if (match) {
      return match[1];
    }

    return fecha;
  }

  private pickString(...values: unknown[]): string {
    for (const value of values) {
      if (typeof value === 'string' && value.trim() !== '') {
        return value.trim();
      }
    }
    return '';
  }

  private pickNumber(...values: unknown[]): number | null {
    for (const value of values) {
      if (value === null || value === undefined || value === '') continue;

      const parsed = Number(value);
      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }
    return null;
  }

  getObservacionesResumen(texto: string | null | undefined, limite: number = 70): string {
    const valor = (texto ?? '').trim();

    if (!valor) {
      return 'Sin observaciones';
    }

    if (valor.length <= limite) {
      return valor;
    }

    return `${valor.slice(0, limite).trim()}...`;
  }

  debeMostrarVerMas(texto: string | null | undefined, limite: number = 70): boolean {
    return ((texto ?? '').trim().length > limite);
  }

  applyFilters(): void {
    const term = this.search.trim().toLowerCase();

    this.solicitudesFiltradas = this.solicitudes.filter((s) => {
      const matchSearch =
        !term ||
        s.folio.toLowerCase().includes(term) ||
        s.unidadNombre.toLowerCase().includes(term) ||
        (s.placa || '').toLowerCase().includes(term) ||
        s.observaciones.toLowerCase().includes(term) ||
        s.solicitadoPor.toLowerCase().includes(term);

      const matchEstado = !this.filtroEstado || s.estado === this.filtroEstado;
      const matchPrioridad = !this.filtroPrioridad || s.prioridad === this.filtroPrioridad;

      return matchSearch && matchEstado && matchPrioridad;
    });

    this.page = 1;
    this.refrescarPaginado();
  }

  refrescarPaginado(): void {
    const start = (this.page - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.solicitudesPaginadas = this.solicitudesFiltradas.slice(start, end);
  }

  get totalPages(): number {
    const total = this.solicitudesFiltradas.length;
    return Math.max(1, Math.ceil(total / this.pageSize));
  }

  get inicioRango(): number {
    const total = this.solicitudesFiltradas.length;
    if (total === 0) return 0;
    return (this.page - 1) * this.pageSize + 1;
  }

  get finRango(): number {
    const total = this.solicitudesFiltradas.length;
    if (total === 0) return 0;
    return Math.min(this.page * this.pageSize, total);
  }

  cambiarPageSize(): void {
    this.page = 1;
    this.refrescarPaginado();
  }

  prevPage(): void {
    if (this.page <= 1) return;
    this.page -= 1;
    this.refrescarPaginado();
  }

  nextPage(): void {
    if (this.page >= this.totalPages) return;
    this.page += 1;
    this.refrescarPaginado();
  }

  totalPendientes(): number {
    return this.solicitudes.filter((s) => s.estado === 'Pendiente').length;
  }

  totalAprobadas(): number {
    return this.solicitudes.filter((s) => s.estado === 'Aprobada').length;
  }

  totalFinalizadas(): number {
    return this.solicitudes.filter((s) => s.estado === 'Finalizada').length;
  }

  totalNoProcedentes(): number {
    return this.solicitudes.filter(
      (s) => s.estado === 'Rechazada' || s.estado === 'Cancelada'
    ).length;
  }

  getEstadoClass(estado: EstadoSolicitud): string {
    switch (estado) {
      case 'Pendiente':
        return 'bg-amber-100 text-amber-800';
      case 'Aprobada':
        return 'bg-blue-100 text-blue-800';
      case 'En proceso':
        return 'bg-cyan-100 text-cyan-800';
      case 'Finalizada':
        return 'bg-emerald-100 text-emerald-800';
      case 'Rechazada':
        return 'bg-rose-100 text-rose-800';
      case 'Cancelada':
        return 'bg-slate-200 text-slate-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  }

  getPrioridadClass(prioridad: PrioridadSolicitud): string {
    switch (prioridad) {
      case 'Baja':
        return 'bg-slate-100 text-slate-700';
      case 'Media':
        return 'bg-blue-100 text-blue-800';
      case 'Alta':
        return 'bg-amber-100 text-amber-800';
      case 'Crítica':
        return 'bg-rose-100 text-rose-800';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  }

  onNuevaSolicitud(): void {
    this.router.navigate(['/mantenimientos/solicitudes/nueva']);
  }

  onVerDetalle(solicitud: SolicitudMantenimientoView): void {
    const detalle = [
      `Folio: ${solicitud.folio}`,
      `Fecha: ${solicitud.fechaSolicitud}`,
      `Unidad: ${solicitud.unidadNombre}${solicitud.placa ? ' • ' + solicitud.placa : ''}`,
      `Tipo: ${solicitud.tipoServicio}`,
      `Prioridad: ${solicitud.prioridad}`,
      `Solicitó: ${solicitud.solicitadoPor}`,
      `Estado: ${solicitud.estado}`,
      `Kilometraje: ${solicitud.kilometraje ?? '—'}`,
      `Observaciones: ${solicitud.observaciones || 'Sin observaciones'}`
    ].join('\n\n');

    alert(detalle);
  }

  onAprobar(solicitud: SolicitudMantenimientoView): void {
    if (solicitud.estado !== 'Pendiente') return;

    const confirmar = confirm(`¿Deseas aprobar la solicitud ${solicitud.folio}?`);
    if (!confirmar) return;

    this.solicitudesService.aprobarSolicitud(solicitud.id).subscribe({
      next: (response) => {
        this.successMessage = response?.message || 'Solicitud aprobada correctamente.';
        this.cargarSolicitudes();
      },
      error: (error) => {
        console.error('Error al aprobar solicitud:', error);
        this.errorMessage = error?.error?.message || 'No se pudo aprobar la solicitud.';
      }
    });
  }

  onContinuarRegistro(solicitud: SolicitudMantenimientoView): void {
    if (solicitud.estado === 'Pendiente') {
      const confirmar = confirm(
        `La solicitud ${solicitud.folio} aún está pendiente. ¿Deseas aprobarla y continuar al registro?`
      );

      if (!confirmar) return;

      this.solicitudesService.aprobarSolicitud(solicitud.id).subscribe({
        next: () => {
          this.router.navigate(['/mantenimientos/registro'], {
            queryParams: {
              modo: 'solicitud',
              solicitudId: solicitud.id,
            }
          });
        },
        error: (error) => {
          console.error('Error al aprobar solicitud antes de continuar:', error);
          this.errorMessage = error?.error?.message || 'No se pudo aprobar la solicitud.';
        }
      });

      return;
    }

    this.router.navigate(['/mantenimientos/registro'], {
      queryParams: {
        modo: 'solicitud',
        solicitudId: solicitud.id,
      }
    });
  }

  onRechazar(solicitud: SolicitudMantenimientoView): void {
    if (solicitud.estado !== 'Pendiente') return;

    const confirmar = confirm(`¿Deseas rechazar la solicitud ${solicitud.folio}?`);
    if (!confirmar) return;

    this.solicitudesService.rechazarSolicitud(solicitud.id).subscribe({
      next: (response) => {
        this.successMessage = response?.message || 'Solicitud rechazada correctamente.';
        this.cargarSolicitudes();
      },
      error: (error) => {
        console.error('Error al rechazar solicitud:', error);
        this.errorMessage = error?.error?.message || 'No se pudo rechazar la solicitud.';
      }
    });
  }

  onCancelarSolicitud(solicitud: SolicitudMantenimientoView): void {
    if (solicitud.estado === 'Cancelada' || solicitud.estado === 'Rechazada') {
      return;
    }

    const confirmar = confirm(`¿Deseas cancelar la solicitud ${solicitud.folio}?`);
    if (!confirmar) return;

    this.solicitudesService.cancelarSolicitud(solicitud.id).subscribe({
      next: (response) => {
        this.successMessage = response?.message || 'Solicitud cancelada correctamente.';
        this.cargarSolicitudes();
      },
      error: (error) => {
        console.error('Error al cancelar solicitud:', error);
        this.errorMessage = error?.error?.message || 'No se pudo cancelar la solicitud.';
      }
    });
  }

  onVolver(): void {
    this.router.navigate(['/mantenimientos']);
  }
}