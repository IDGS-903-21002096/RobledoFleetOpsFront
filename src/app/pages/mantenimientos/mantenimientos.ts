import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { CabeceraComponent } from '../../components/cabecera/cabecera';
import { FooterComponent } from '../../components/footer/footer';

type TipoServicio = 'Preventivo' | 'Correctivo';
type EstatusMantenimiento = 'Programado' | 'En proceso' | 'Terminado' | 'Cancelado';
type ServicioNivel = 'Servicio menor' | 'Servicio mayor';

type MantenimientoRow = {
  id: number;
  noOrden?: string;
  fecha: string; // YYYY-MM-DD
  unidadId: number;
  unidad: string;
  tipoServicio: TipoServicio;
  nivelServicio: ServicioNivel;
  kilometraje?: number;
  estatus: EstatusMantenimiento;
  costoFinal?: number;
};

@Component({
  selector: 'app-mantenimientos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CabeceraComponent, FooterComponent],
  templateUrl: './mantenimientos.html',
})
export class MantenimientosComponent {
  search = '';
  pageSize = 12;

  mantenimientos: MantenimientoRow[] = [
    {
      id: 1,
      noOrden: 'OS-000126',
      fecha: '2026-03-05',
      unidadId: 1,
      unidad: 'Unidad 01',
      tipoServicio: 'Preventivo',
      nivelServicio: 'Servicio menor',
      kilometraje: 120350,
      estatus: 'Terminado',
      costoFinal: 2450,
    },
    {
      id: 2,
      noOrden: 'OS-000125',
      fecha: '2026-03-04',
      unidadId: 2,
      unidad: 'Unidad 02',
      tipoServicio: 'Correctivo',
      nivelServicio: 'Servicio mayor',
      kilometraje: 89210,
      estatus: 'En proceso',
      costoFinal: 6800,
    },
    {
      id: 3,
      noOrden: 'OS-000124',
      fecha: '2026-03-03',
      unidadId: 3,
      unidad: 'Unidad 03',
      tipoServicio: 'Preventivo',
      nivelServicio: 'Servicio menor',
      kilometraje: 150210,
      estatus: 'Programado',
      costoFinal: 0,
    },
    {
      id: 4,
      noOrden: 'OS-000123',
      fecha: '2026-02-27',
      unidadId: 4,
      unidad: 'Unidad 04',
      tipoServicio: 'Correctivo',
      nivelServicio: 'Servicio mayor',
      kilometraje: 99880,
      estatus: 'Cancelado',
      costoFinal: 0,
    },
  ];

  constructor(private router: Router) {}

  private parseDateToMs(dateStr: string): number {
    const ms = Date.parse(dateStr);
    return isNaN(ms) ? 0 : ms;
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
            String(m.unidadId),
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

    // Consulta general: más recientes arriba
    const ordered = [...base].sort(
      (a, b) => this.parseDateToMs(b.fecha) - this.parseDateToMs(a.fecha)
    );

    return ordered.slice(0, this.pageSize);
  }

  onRegistrarMantenimiento(): void {
    this.router.navigate(['/mantenimientos/registro']);
  }

  onVerRecordatorios(): void {
    this.router.navigate(['/mantenimientos/recordatorios']);
  }

  onEditar(m: MantenimientoRow): void {
    this.router.navigate(['/mantenimientos/registro'], {
      queryParams: { id: m.id },
    });
  }

  onEliminar(m: MantenimientoRow): void {
    // Luego se amarra a permisos por rol
    console.log('Eliminar mantenimiento:', m);
  }
}