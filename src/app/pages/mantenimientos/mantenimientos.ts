import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { CabeceraComponent } from '../../components/cabecera/cabecera';
import { FooterComponent } from '../../components/footer/footer';
import {
  CrearMantenimientoRequest,
  MantenimientoDetalle,
  MantenimientosService
} from '../../../services/mantenimientos.service';

type TipoServicio = 'Preventivo' | 'Correctivo';
type EstatusMantenimiento = 'Programado' | 'En proceso' | 'Finalizado' | 'Cancelado';
type ServicioNivel = 'Servicio menor' | 'Servicio mayor';

type MantenimientoRow = {
  id: number;
  noOrden?: string | null;
  fecha: string;
  vehiculoId: number;
  unidad: string;
  tipoServicio: TipoServicio | string;
  nivelServicio: ServicioNivel | string;
  kilometraje?: number | null;
  estatus: EstatusMantenimiento | string;
  costoFinal?: number | null;
};

@Component({
  selector: 'app-mantenimientos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CabeceraComponent, FooterComponent],
  templateUrl: './mantenimientos.html',
})
export class MantenimientosComponent implements OnInit {
  private router = inject(Router);
  private mantenimientosService = inject(MantenimientosService);

  search = '';
  page = 1;
  pageSize = 5;

  mantenimientos: MantenimientoRow[] = [];

  loading = false;
  errorMessage = '';
  successMessage = '';
  processingStatusId: number | null = null;

  ngOnInit(): void {
    this.cargarMantenimientos();
  }

  cargarMantenimientos(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.mantenimientosService.getMantenimientos().subscribe({
      next: (data) => {
        this.mantenimientos = (data ?? []).map((m: any) => ({
          id: m.id,
          noOrden: m.noOrden ?? null,
          fecha: m.fecha,
          vehiculoId: m.vehiculoId,
          unidad: m.unidad,
          tipoServicio: m.tipoServicio,
          nivelServicio: m.nivelServicio,
          kilometraje: m.kilometraje ?? null,
          estatus: this.normalizarEstatus(m.estatus),
          costoFinal: m.costoFinal ?? null,
        }));

        this.page = 1;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar mantenimientos:', error);
        this.errorMessage = this.getLoadErrorMessage(error, 'los mantenimientos');
        this.mantenimientos = [];
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

  private normalizarEstatus(estatus: string | null | undefined): string {
    if (!estatus) return 'Programado';
    return estatus === 'Terminado' ? 'Finalizado' : estatus;
  }

  private parseDateToMs(dateStr: string): number {
    const ms = Date.parse(dateStr);
    return isNaN(ms) ? 0 : ms;
  }

  private getFechaSolo(fecha: string | null | undefined): string {
    if (!fecha) return '';
    return fecha.substring(0, 10);
  }

  private getHoyLocal(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = `${now.getMonth() + 1}`.padStart(2, '0');
    const day = `${now.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private isFechaHabilitadaParaEjecucion(fecha: string | null | undefined): boolean {
    const fechaSolo = this.getFechaSolo(fecha);
    if (!fechaSolo) return false;
    return fechaSolo <= this.getHoyLocal();
  }

  filteredMantenimientos(): MantenimientoRow[] {
    const q = this.search.trim().toLowerCase();

    const base = !q
      ? this.mantenimientos
      : this.mantenimientos.filter((m) => {
          const blob = [
            m.noOrden ?? '',
            String(m.id),
            m.fecha,
            m.unidad,
            String(m.vehiculoId),
            m.tipoServicio,
            m.nivelServicio,
            String(m.kilometraje ?? ''),
            m.estatus,
            String(m.costoFinal ?? ''),
          ]
            .join(' ')
            .toLowerCase();

          return blob.includes(q);
        });

    return [...base].sort(
      (a, b) => this.parseDateToMs(b.fecha) - this.parseDateToMs(a.fecha)
    );
  }

  paginatedMantenimientos(): MantenimientoRow[] {
    const start = (this.page - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredMantenimientos().slice(start, end);
  }

  get totalPages(): number {
    const total = this.filteredMantenimientos().length;
    return Math.max(1, Math.ceil(total / this.pageSize));
  }

  get inicioRango(): number {
    const total = this.filteredMantenimientos().length;
    if (total === 0) return 0;
    return (this.page - 1) * this.pageSize + 1;
  }

  get finRango(): number {
    const total = this.filteredMantenimientos().length;
    if (total === 0) return 0;
    return Math.min(this.page * this.pageSize, total);
  }

  onSearchChange(): void {
    this.page = 1;
  }

  cambiarPageSize(): void {
    this.page = 1;
  }

  prevPage(): void {
    if (this.page <= 1) return;
    this.page -= 1;
  }

  nextPage(): void {
    if (this.page >= this.totalPages) return;
    this.page += 1;
  }

  getEstatusClass(estatus: string): string {
    const valor = this.normalizarEstatus(estatus);

    switch (valor) {
      case 'Finalizado':
        return 'bg-green-100 text-green-700';
      case 'Cancelado':
        return 'bg-red-100 text-red-700';
      case 'En proceso':
        return 'bg-blue-100 text-blue-700';
      case 'Programado':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  }

  canMoveToEnProceso(m: MantenimientoRow): boolean {
    return this.normalizarEstatus(m.estatus) === 'Programado'
      && this.isFechaHabilitadaParaEjecucion(m.fecha);
  }

  canMoveToFinalizado(m: MantenimientoRow): boolean {
    return this.normalizarEstatus(m.estatus) === 'En proceso'
      && this.isFechaHabilitadaParaEjecucion(m.fecha);
  }

  trackByMantenimientoId(_: number, m: MantenimientoRow): number {
    return m.id;
  }

  onRegistrarMantenimiento(): void {
    this.router.navigate(['/mantenimientos/registro']);
  }

  onVerRecordatorios(): void {
    this.router.navigate(['/mantenimientos/recordatorios']);
  }

  onEditar(m: MantenimientoRow): void {
    this.router.navigate(['/mantenimientos/registro', m.id, 'editar']);
  }

  onCambiarEstatusRapido(
    m: MantenimientoRow,
    nuevoEstatus: 'En proceso' | 'Finalizado'
  ): void {
    if (!this.isFechaHabilitadaParaEjecucion(m.fecha)) {
      this.errorMessage =
        'No se puede iniciar o finalizar un mantenimiento antes de la fecha programada. Actualiza la fecha primero.';
      this.successMessage = '';
      return;
    }

    const accionTexto = nuevoEstatus === 'En proceso' ? 'marcar en curso' : 'finalizar';
    const confirmar = confirm(`¿Deseas ${accionTexto} el mantenimiento ${m.noOrden || '#' + m.id}?`);
    if (!confirmar) return;

    this.errorMessage = '';
    this.successMessage = '';
    this.processingStatusId = m.id;

    if (nuevoEstatus === 'Finalizado') {
      this.mantenimientosService.cerrarMantenimiento(m.id).subscribe({
        next: (response) => {
          this.successMessage =
            response?.message ||
            `Mantenimiento ${m.noOrden || '#' + m.id} cerrado correctamente.`;

          this.processingStatusId = null;
          this.cargarMantenimientos();
        },
        error: (error) => {
          console.error('Error al cerrar mantenimiento:', error);
          this.errorMessage =
            error?.error?.message ||
            error?.error?.detail ||
            error?.error ||
            'No se pudo cerrar el mantenimiento.';
          this.processingStatusId = null;
        }
      });

      return;
    }

    this.mantenimientosService.getMantenimientoById(m.id).subscribe({
      next: (detalle: MantenimientoDetalle) => {
        const payload = this.mapDetalleToUpdateRequest(detalle, 'En proceso');

        this.mantenimientosService.actualizarMantenimiento(m.id, payload).subscribe({
          next: (response) => {
            this.successMessage =
              response?.message ||
              `Mantenimiento ${m.noOrden || '#' + m.id} actualizado correctamente.`;

            this.processingStatusId = null;
            this.cargarMantenimientos();
          },
          error: (error) => {
            console.error('Error al actualizar estatus del mantenimiento:', error);
            this.errorMessage =
              error?.error?.message ||
              error?.error?.detail ||
              error?.error ||
              'No se pudo actualizar el estatus del mantenimiento.';
            this.processingStatusId = null;
          }
        });
      },
      error: (error) => {
        console.error('Error al consultar detalle del mantenimiento:', error);
        this.errorMessage =
          error?.error?.message ||
          error?.error ||
          'No se pudo consultar el detalle del mantenimiento.';
        this.processingStatusId = null;
      }
    });
  }

  private mapDetalleToUpdateRequest(
    detalle: MantenimientoDetalle,
    nuevoEstatus: 'En proceso'
  ): CrearMantenimientoRequest {
    return {
      fecha: detalle.fecha,
      fechaSiguienteMantenimiento: detalle.fechaSiguienteMantenimiento,
      horasTecnico: detalle.horasTecnico ?? null,
      vehiculoId: detalle.vehiculoId,
      tipoServicio: detalle.tipoServicio,
      kilometraje: detalle.kilometraje,
      estatus: nuevoEstatus,
      nivelServicio: detalle.nivelServicio,
      tecnicosTexto: detalle.tecnicosTexto,
      observaciones: detalle.observaciones ?? null,
      origenMantenimiento: detalle.origenMantenimiento,
      solicitudMantenimientoId: detalle.solicitudMantenimientoId ?? null,

      revisionNiveles: detalle.revisionNiveles,
      limpiezaAjusteFrenos: detalle.limpiezaAjusteFrenos,
      engrasado: detalle.engrasado,
      revisionLuces: detalle.revisionLuces,
      revisionSuspension: detalle.revisionSuspension,
      revisionCarroceria: detalle.revisionCarroceria,
      revisionSistemaElectrico: detalle.revisionSistemaElectrico,
      checklistOtro: detalle.checklistOtro,
      checklistOtroTexto: detalle.checklistOtroTexto ?? null,

      manoObra: detalle.manoObra,
      detalles: (detalle.detalles ?? []).map((item) => ({
        articuloInventarioId: item.articuloInventarioId,
        cantidad: item.cantidad,
        precioUnitarioAplicado: item.precioUnitarioAplicado
      }))
    };
  }

  onEliminar(m: MantenimientoRow): void {
    const confirmar = confirm(`¿Deseas eliminar el mantenimiento ${m.noOrden || '#' + m.id}?`);
    if (!confirmar) return;

    this.mantenimientosService.eliminarMantenimiento(m.id).subscribe({
      next: (response) => {
        this.successMessage = response?.message || 'Mantenimiento eliminado correctamente.';
        this.cargarMantenimientos();
      },
      error: (error) => {
        console.error('Error al eliminar mantenimiento:', error);
        this.errorMessage = error?.error?.message || error?.error || 'No se pudo eliminar el mantenimiento.';
      }
    });
  }
}