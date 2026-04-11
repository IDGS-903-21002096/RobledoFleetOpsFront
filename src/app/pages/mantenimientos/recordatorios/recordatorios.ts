import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { CabeceraComponent } from '../../../components/cabecera/cabecera';
import { FooterComponent } from '../../../components/footer/footer';
import { MantenimientosService } from '../../../../services/mantenimientos.service';

type TipoServicio = 'Preventivo' | 'Correctivo';
type EstatusMantenimiento = 'Programado' | 'En proceso' | 'Finalizado' | 'Cancelado';
type ServicioNivel = 'Servicio menor' | 'Servicio mayor';

type RecordatorioMantenimientoRow = {
  id: number;
  noOrden?: string | null;
  fecha: string;
  vehiculoId: number;
  unidad: string;
  tipoServicio: TipoServicio | string;
  nivelServicio: ServicioNivel | string;
  kilometraje?: number | null;
  estatus: EstatusMantenimiento | string;
};

@Component({
  selector: 'app-recordatorios',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CabeceraComponent, FooterComponent],
  templateUrl: './recordatorios.html',
})
export class RecordatoriosComponent implements OnInit {
  private router = inject(Router);
  private mantenimientosService = inject(MantenimientosService);

  search = '';
  page = 1;
  pageSize = 5;

  recordatorios: RecordatorioMantenimientoRow[] = [];

  loading = false;
  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    this.cargarRecordatorios();
  }

  cargarRecordatorios(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.mantenimientosService.getRecordatorios().subscribe({
      next: (data) => {
        this.recordatorios = (data ?? []).map((r: any) => ({
          id: r.id,
          noOrden: r.noOrden ?? null,
          fecha: r.fecha,
          vehiculoId: r.vehiculoId,
          unidad: r.unidad,
          tipoServicio: r.tipoServicio,
          nivelServicio: r.nivelServicio,
          kilometraje: r.kilometraje ?? null,
          estatus: this.normalizarEstatus(r.estatus),
        }));
        this.page = 1;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar recordatorios:', error);
        this.errorMessage = this.getLoadErrorMessage(error, 'los recordatorios');
        this.recordatorios = [];
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
    return isNaN(ms) ? Number.MAX_SAFE_INTEGER : ms;
  }

  filteredRecordatorios(): RecordatorioMantenimientoRow[] {
    const q = this.search.trim().toLowerCase();

    const base = !q
      ? this.recordatorios
      : this.recordatorios.filter((r) => {
          const blob = [
            r.noOrden ?? '',
            String(r.id),
            r.fecha,
            r.unidad,
            String(r.vehiculoId),
            r.tipoServicio,
            r.nivelServicio,
            String(r.kilometraje ?? ''),
            r.estatus,
          ]
            .join(' ')
            .toLowerCase();

          return blob.includes(q);
        });

    return [...base].sort((a, b) => this.parseDateToMs(a.fecha) - this.parseDateToMs(b.fecha));
  }

  paginatedRecordatorios(): RecordatorioMantenimientoRow[] {
    const start = (this.page - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredRecordatorios().slice(start, end);
  }

  get totalPages(): number {
    const total = this.filteredRecordatorios().length;
    return Math.max(1, Math.ceil(total / this.pageSize));
  }

  get inicioRango(): number {
    const total = this.filteredRecordatorios().length;
    if (total === 0) return 0;
    return (this.page - 1) * this.pageSize + 1;
  }

  get finRango(): number {
    const total = this.filteredRecordatorios().length;
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

  trackByRecordatorioId(_: number, r: RecordatorioMantenimientoRow): number {
    return r.id;
  }

  onVolver(): void {
    this.router.navigate(['/mantenimientos']);
  }

  onEditarActualizar(r: RecordatorioMantenimientoRow): void {
    this.router.navigate(['/mantenimientos/registro', r.id, 'editar']);
  }

  onEliminar(r: RecordatorioMantenimientoRow): void {
    const confirmar = confirm(`¿Deseas eliminar el mantenimiento ${r.noOrden || '#' + r.id}?`);
    if (!confirmar) return;

    this.mantenimientosService.eliminarMantenimiento(r.id).subscribe({
      next: (response) => {
        this.successMessage = response?.message || 'Recordatorio eliminado correctamente.';
        this.cargarRecordatorios();
      },
      error: (error) => {
        console.error('Error al eliminar mantenimiento desde recordatorios:', error);
        this.errorMessage = error?.error?.message || error?.error || 'No se pudo eliminar el recordatorio.';
      }
    });
  }
}