import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { CabeceraComponent } from '../../../components/cabecera/cabecera';
import { FooterComponent } from '../../../components/footer/footer';

type TipoServicio = 'Preventivo' | 'Correctivo';
type PrioridadSolicitud = 'Baja' | 'Media' | 'Alta' | 'Crítica';

@Component({
  selector: 'app-registro-solicitud-mantenimiento',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CabeceraComponent, FooterComponent],
  templateUrl: './registro-solicitud-mantenimiento.html',
})
export class RegistroSolicitudMantenimientoComponent {
  unidadesCatalogo: { id: number; nombre: string; placa?: string }[] = [
    { id: 1, nombre: 'Unidad 01', placa: 'GTO-123-A' },
    { id: 2, nombre: 'Unidad 02', placa: 'GTO-456-B' },
    { id: 3, nombre: 'Unidad 03', placa: 'GTO-789-C' },
  ];

  // Referencia visual temporal.
  // Más adelante también puede venir del backend.
  folioReferencia = 'SM-0005';

  unidadId: number | null = null;
  tipoServicio: TipoServicio | '' = '';
  prioridad: PrioridadSolicitud | '' = '';
  kilometraje: number | null = null;
  observaciones = '';

  touched = {
    unidad: false,
    tipoServicio: false,
    prioridad: false,
    observaciones: false,
  };

  constructor(private router: Router) {}

  private isValid(): boolean {
    this.touched.unidad = true;
    this.touched.tipoServicio = true;
    this.touched.prioridad = true;
    this.touched.observaciones = true;

    const okUnidad = this.unidadId !== null;
    const okTipo = !!this.tipoServicio;
    const okPrioridad = !!this.prioridad;
    const okObservaciones = this.observaciones.trim().length > 0;

    return okUnidad && okTipo && okPrioridad && okObservaciones;
  }

  onCancelar(): void {
    this.router.navigate(['/mantenimientos/solicitudes']);
  }

  onGuardar(): void {
    if (!this.isValid()) return;

    const payload = {
      folio: this.folioReferencia,
      unidadId: this.unidadId,
      tipoServicio: this.tipoServicio,
      prioridad: this.prioridad,
      kilometraje: this.kilometraje,
      observaciones: this.observaciones.trim(),
    };

    console.log('Payload solicitud mantenimiento:', payload);

    // Más adelante:
    // El backend deberá asignar:
    // - fechaSolicitud
    // - solicitadoPor
    // - estado = Pendiente
    // - folio definitivo (si así se decide)

    this.router.navigate(['/mantenimientos/solicitudes']);
  }
}