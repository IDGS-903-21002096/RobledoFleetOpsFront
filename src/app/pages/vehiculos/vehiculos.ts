import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { CabeceraComponent } from '../../components/cabecera/cabecera';
import { FooterComponent } from '../../components/footer/footer';
import { Vehiculo, VehiculosService } from '../../../services/vehiculos.service';

type EstatusVehiculo = 'Asignado' | 'Disponible' | 'En taller' | 'Fuera de Servicio';

type VehiculoCard = {
  id: number;
  nombre: string;
  tipo: string;
  grupo?: string;
  placa?: string;
  estatus: EstatusVehiculo;
  activo: boolean;
};

type EstadoFiltro = 'ACTIVOS' | 'INACTIVOS';

@Component({
  selector: 'app-vehiculos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CabeceraComponent, FooterComponent],
  templateUrl: './vehiculos.html',
})
export class VehiculosComponent implements OnInit {
  private router = inject(Router);
  private vehiculosService = inject(VehiculosService);

  search = '';
  pageSize = 12;

  loading = false;
  errorMessage = '';

  estadoFiltro: EstadoFiltro = 'ACTIVOS';

  vehiculos: VehiculoCard[] = [];

  ngOnInit(): void {
    this.cargarVehiculos();
  }

  cargarVehiculos(): void {
    this.loading = true;
    this.errorMessage = '';

    const request$ =
      this.estadoFiltro === 'ACTIVOS'
        ? this.vehiculosService.getVehiculosActivos()
        : this.vehiculosService.getVehiculosInactivos();

    request$.subscribe({
      next: (data) => {
        this.vehiculos = (data ?? []).map((v) => this.mapVehiculoToCard(v));
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar vehículos:', error);
        this.errorMessage = this.getLoadErrorMessage(error, 'los vehículos');
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

  private mapVehiculoToCard(v: Vehiculo): VehiculoCard {
    return {
      id: v.id,
      nombre: v.nombreVehiculo,
      tipo: v.tipoVehiculo,
      grupo: v.grupo ?? '',
      placa: v.placa ?? '',
      estatus: v.statusInicial as EstatusVehiculo,
      activo: v.activo,
    };
  }

  filteredVehiculos(): VehiculoCard[] {
    const q = this.search.trim().toLowerCase();

    const list = !q
      ? this.vehiculos
      : this.vehiculos.filter((v) => {
          const blob = [
            v.nombre,
            v.tipo,
            v.grupo ?? '',
            v.placa ?? '',
            v.estatus,
          ]
            .join(' ')
            .toLowerCase();

          return blob.includes(q);
        });

    return list.slice(0, this.pageSize);
  }

  onCambiarFiltro(estado: EstadoFiltro): void {
    if (this.estadoFiltro === estado) return;
    this.estadoFiltro = estado;
    this.cargarVehiculos();
  }

  onAgregarVehiculo(): void {
    this.router.navigate(['/vehiculos/nuevo']);
  }

  onVerDetalle(v: VehiculoCard): void {
    this.router.navigate(['/vehiculos', v.id]);
  }

  onIrDocumentos(v: VehiculoCard): void {
    this.router.navigate(['/vehiculos', v.id, 'documentos']);
  }

  onEditar(v: VehiculoCard): void {
    this.router.navigate(['/vehiculos', v.id, 'editar']);
  }

  onEliminar(v: VehiculoCard): void {
    const confirmar = confirm(`¿Deseas inactivar el vehículo "${v.nombre}"?`);
    if (!confirmar) return;

    this.vehiculosService.inactivarVehiculo(v.id).subscribe({
      next: () => {
        this.cargarVehiculos();
      },
      error: (error) => {
        console.error('Error al inactivar vehículo:', error);
        alert(error?.error?.mensaje || 'No se pudo inactivar el vehículo.');
      }
    });
  }

  onReactivar(v: VehiculoCard): void {
    const confirmar = confirm(`¿Deseas reactivar el vehículo "${v.nombre}"?`);
    if (!confirmar) return;

    this.vehiculosService.reactivarVehiculo(v.id).subscribe({
      next: () => {
        this.cargarVehiculos();
      },
      error: (error) => {
        console.error('Error al reactivar vehículo:', error);
        alert(error?.error?.mensaje || 'No se pudo reactivar el vehículo.');
      }
    });
  }
}