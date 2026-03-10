import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { CabeceraComponent } from '../../../components/cabecera/cabecera';
import { FooterComponent } from '../../../components/footer/footer';

type TipoServicio = 'Preventivo' | 'Correctivo';
type EstatusMantenimiento = 'Programado' | 'En proceso' | 'Terminado' | 'Cancelado';
type ServicioNivel = 'Servicio menor' | 'Servicio mayor';

type RecordatorioMantenimientoRow = {
  id: number;                // MantenimientoId
  noOrden?: string;          // opcional
  fecha: string;             // YYYY-MM-DD (fecha objetivo/programada)
  unidadId: number;
  unidad: string;
  tipoServicio: TipoServicio;
  nivelServicio: ServicioNivel;
  kilometraje?: number;
  estatus: EstatusMantenimiento;
};

@Component({
  selector: 'app-recordatorios',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CabeceraComponent, FooterComponent],
  templateUrl: './recordatorios.html',
})
export class RecordatoriosComponent {
  search = '';
  pageSize = 25;

  // Mock alineado a Registro
  recordatorios: RecordatorioMantenimientoRow[] = [
    {
      id: 1,
      noOrden: 'OS-000124',
      fecha: '2026-03-10',
      unidadId: 1,
      unidad: 'Unidad 01',
      tipoServicio: 'Preventivo',
      nivelServicio: 'Servicio menor',
      kilometraje: 121000,
      estatus: 'Programado',
    },
    {
      id: 2,
      noOrden: 'OS-000125',
      fecha: '2026-03-06',
      unidadId: 2,
      unidad: 'Unidad 02',
      tipoServicio: 'Correctivo',
      nivelServicio: 'Servicio mayor',
      kilometraje: 89210,
      estatus: 'En proceso',
    },
    {
      id: 3,
      noOrden: 'OS-000120',
      fecha: '2026-03-04',
      unidadId: 3,
      unidad: 'Unidad 03',
      tipoServicio: 'Preventivo',
      nivelServicio: 'Servicio menor',
      kilometraje: 150210,
      estatus: 'Programado',
    },
  ];

  constructor(private router: Router) {}

  private parseDateToMs(dateStr: string): number {
    // YYYY-MM-DD -> ms
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
            String(r.unidadId),
            r.tipoServicio,
            r.nivelServicio,
            String(r.kilometraje ?? ''),
            r.estatus,
          ]
            .join(' ')
            .toLowerCase();

          return blob.includes(q);
        });

    // ✅ Orden: más próximos arriba (fecha asc)
    const ordered = [...base].sort((a, b) => this.parseDateToMs(a.fecha) - this.parseDateToMs(b.fecha));

    return ordered.slice(0, this.pageSize);
  }

  onVolver(): void {
    this.router.navigate(['/mantenimientos']);
  }

  onEditarActualizar(r: RecordatorioMantenimientoRow): void {
    // Aquí el objetivo es actualizar estatus / datos.
    // Por ahora reusamos registro con queryParam para modo edición.
    this.router.navigate(['/mantenimientos/registro'], { queryParams: { id: r.id } });
  }

  onEliminar(r: RecordatorioMantenimientoRow): void {
    // Luego lo amarramos a permisos por rol (solo admins o rol autorizado).
    console.log('Eliminar mantenimiento (recordatorio):', r);
  }
}