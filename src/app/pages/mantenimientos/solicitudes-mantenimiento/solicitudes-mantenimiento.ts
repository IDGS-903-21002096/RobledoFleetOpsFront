import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { CabeceraComponent } from '../../../components/cabecera/cabecera';
import { FooterComponent } from '../../../components/footer/footer';

type TipoServicio = 'Preventivo' | 'Correctivo';
type EstadoSolicitud =
  | 'Pendiente'
  | 'Aprobada'
  | 'En proceso'
  | 'Finalizada'
  | 'Rechazada'
  | 'Cancelada';

type PrioridadSolicitud = 'Baja' | 'Media' | 'Alta' | 'Crítica';

type SolicitudMantenimiento = {
  id: number;
  folio: string;
  fechaSolicitud: string;
  unidadId: number;
  unidadNombre: string;
  placa?: string;
  tipoServicio: TipoServicio;
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
export class SolicitudesMantenimientoComponent {
  solicitudes: SolicitudMantenimiento[] = [
    {
      id: 1,
      folio: 'SM-0001',
      fechaSolicitud: '2026-03-10',
      unidadId: 1,
      unidadNombre: 'Unidad 01',
      placa: 'GTO-123-A',
      tipoServicio: 'Correctivo',
      prioridad: 'Alta',
      kilometraje: 120345,
      observaciones: 'Se detecta ruido en frenos delanteros y vibración al frenar.',
      solicitadoPor: 'Supervisor Patio',
      estado: 'Pendiente',
    },
    {
      id: 2,
      folio: 'SM-0002',
      fechaSolicitud: '2026-03-09',
      unidadId: 2,
      unidadNombre: 'Unidad 02',
      placa: 'GTO-456-B',
      tipoServicio: 'Preventivo',
      prioridad: 'Media',
      kilometraje: 98500,
      observaciones: 'Solicitud de servicio preventivo general por kilometraje.',
      solicitadoPor: 'Jefe Operativo',
      estado: 'Aprobada',
    },
    {
      id: 3,
      folio: 'SM-0003',
      fechaSolicitud: '2026-03-08',
      unidadId: 3,
      unidadNombre: 'Unidad 03',
      placa: 'GTO-789-C',
      tipoServicio: 'Correctivo',
      prioridad: 'Crítica',
      kilometraje: 143220,
      observaciones: 'La unidad presenta fuga de aceite visible en patio.',
      solicitadoPor: 'Supervisor Taller',
      estado: 'En proceso',
    },
    {
      id: 4,
      folio: 'SM-0004',
      fechaSolicitud: '2026-03-06',
      unidadId: 1,
      unidadNombre: 'Unidad 01',
      placa: 'GTO-123-A',
      tipoServicio: 'Preventivo',
      prioridad: 'Baja',
      kilometraje: 118700,
      observaciones: 'Revisión programada de niveles y ajuste general.',
      solicitadoPor: 'Supervisor Patio',
      estado: 'Finalizada',
    },
  ];

  solicitudesFiltradas: SolicitudMantenimiento[] = [...this.solicitudes];

  search = '';
  filtroEstado = '';
  filtroPrioridad = '';

  constructor(private router: Router) {}

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
        return 'bg-indigo-100 text-indigo-800';
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

  onVerDetalle(solicitud: SolicitudMantenimiento): void {
    console.log('Ver detalle solicitud:', solicitud);
  }

  onAprobar(solicitud: SolicitudMantenimiento): void {
    if (solicitud.estado !== 'Pendiente') return;

    solicitud.estado = 'Aprobada';
    this.applyFilters();
    console.log('Solicitud aprobada:', solicitud);
  }

  onContinuarRegistro(solicitud: SolicitudMantenimiento): void {
  if (solicitud.estado === 'Pendiente') {
    solicitud.estado = 'Aprobada';
  }

    this.applyFilters();

    this.router.navigate(['/mantenimientos/registro'], {
      queryParams: {
        modo: 'solicitud',
        solicitudId: solicitud.id,
      }
    });
  }

  onRechazar(solicitud: SolicitudMantenimiento): void {
    if (solicitud.estado !== 'Pendiente') return;

    solicitud.estado = 'Rechazada';
    this.applyFilters();
    console.log('Solicitud rechazada:', solicitud);
  }

  onCancelarSolicitud(solicitud: SolicitudMantenimiento): void {
    if (
      solicitud.estado === 'Finalizada' ||
      solicitud.estado === 'Cancelada' ||
      solicitud.estado === 'Rechazada'
    ) {
      return;
    }

    solicitud.estado = 'Cancelada';
    this.applyFilters();
    console.log('Solicitud cancelada:', solicitud);
  }

  onVolver(): void {
    this.router.navigate(['/mantenimientos']);
  }
}