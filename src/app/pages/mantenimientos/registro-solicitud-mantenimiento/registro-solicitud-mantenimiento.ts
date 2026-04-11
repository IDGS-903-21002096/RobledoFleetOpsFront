import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { CabeceraComponent } from '../../../components/cabecera/cabecera';
import { FooterComponent } from '../../../components/footer/footer';

import { Vehiculo, VehiculosService } from '../../../../services/vehiculos.service';
import {
  CrearSolicitudMantenimientoRequest,
  SolicitudesMantenimientoService
} from '../../../../services/solicitudes-mantenimiento.service';

type TipoServicio = 'Preventivo' | 'Correctivo';
type PrioridadSolicitud = 'Baja' | 'Media' | 'Alta' | 'Crítica';

@Component({
  selector: 'app-registro-solicitud-mantenimiento',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CabeceraComponent, FooterComponent],
  templateUrl: './registro-solicitud-mantenimiento.html',
})
export class RegistroSolicitudMantenimientoComponent implements OnInit {
  private router = inject(Router);
  private vehiculosService = inject(VehiculosService);
  private solicitudesService = inject(SolicitudesMantenimientoService);

  unidadesCatalogo: Vehiculo[] = [];

  form = {
    vehiculoId: null as number | null,
    tipoServicio: '' as TipoServicio | '',
    prioridad: '' as PrioridadSolicitud | '',
    kilometraje: null as number | null,
    observaciones: '',
    solicitadoPorNombre: '',
  };

  touched = {
    unidad: false,
    tipoServicio: false,
    prioridad: false,
    observaciones: false,
  };

  loadingVehiculos = false;
  saving = false;
  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    this.cargarVehiculos();
  }

  private cargarVehiculos(): void {
    this.loadingVehiculos = true;
    this.errorMessage = '';

    this.vehiculosService.getVehiculosActivos().subscribe({
      next: (data) => {
        this.unidadesCatalogo = data ?? [];
        this.loadingVehiculos = false;
      },
      error: (error) => {
        console.error('Error al cargar unidades:', error);
        this.errorMessage = 'No se pudieron cargar las unidades.';
        this.loadingVehiculos = false;
      }
    });
  }

  private isValid(): boolean {
    this.touched.unidad = true;
    this.touched.tipoServicio = true;
    this.touched.prioridad = true;
    this.touched.observaciones = true;

    const okUnidad = this.form.vehiculoId !== null;
    const okTipo = !!this.form.tipoServicio;
    const okPrioridad = !!this.form.prioridad;
    const okObservaciones = this.form.observaciones.trim().length > 0;

    return okUnidad && okTipo && okPrioridad && okObservaciones;
  }

  onCancelar(): void {
    this.router.navigate(['/mantenimientos/solicitudes']);
  }

  onGuardar(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.isValid()) {
      this.errorMessage = 'Revisa los campos obligatorios.';
      return;
    }

    const payload: CrearSolicitudMantenimientoRequest = {
      vehiculoId: this.form.vehiculoId as number,
      tipoServicio: this.form.tipoServicio as TipoServicio,
      prioridad: this.form.prioridad as PrioridadSolicitud,
      kilometraje: this.form.kilometraje,
      observaciones: this.form.observaciones.trim(),
      solicitadoPorNombre: this.form.solicitadoPorNombre.trim() || null,
    };

    this.saving = true;

    this.solicitudesService.crearSolicitud(payload).subscribe({
      next: (response) => {
        this.saving = false;
        this.successMessage = response?.message
          ? `${response.message} Folio: ${response.folio}.`
          : 'Solicitud creada correctamente.';

        this.router.navigate(['/mantenimientos/solicitudes']);
      },
      error: (error) => {
        console.error('Error al guardar solicitud:', error);
        this.errorMessage = error?.error?.message || error?.error || 'No se pudo guardar la solicitud.';
        this.saving = false;
      }
    });
  }
}