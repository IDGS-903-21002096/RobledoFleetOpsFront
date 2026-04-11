import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { CabeceraComponent } from '../../../components/cabecera/cabecera';
import { FooterComponent } from '../../../components/footer/footer';
import { Vehiculo, VehiculosService } from '../../../../services/vehiculos.service';

type StatusVehiculo = 'Asignado' | 'Disponible' | 'En taller' | 'Fuera de Servicio';

type VehiculoDetalle = {
  id: number;
  nombreVehiculo: string;
  marca: string;
  modelo: string;
  anio: number | null;
  tipoVehiculo: string;
  statusVehiculo: StatusVehiculo;
  grupo?: string;
  division?: string;
  numeroSerie?: string;
  placa?: string;
  color?: string;
  companiaSeguros?: string;
  polizaSeguro?: string;
  vigenciaPoliza?: string;
  inicioEstadisticas?: 'Fecha de registro' | 'Fecha de compra' | '';
  medidaUso?: 'Kilómetros' | 'Millas' | 'Horas' | '';
  medidaCombustible?: 'Litros' | 'Galones' | '';
};

@Component({
  selector: 'app-vehiculo-detalle',
  standalone: true,
  imports: [CommonModule, RouterModule, CabeceraComponent, FooterComponent],
  templateUrl: './vehiculo-detalle.html',
  styleUrl: './vehiculo-detalle.scss',
})
export class VehiculoDetalleComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private vehiculosService = inject(VehiculosService);

  vehiculoId: number | null = null;
  vehiculo: VehiculoDetalle | null = null;

  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.vehiculoId = idParam ? Number(idParam) : null;

    if (!this.vehiculoId || Number.isNaN(this.vehiculoId)) {
      this.errorMessage = 'No se recibió un ID de vehículo válido.';
      return;
    }

    this.cargarVehiculo(this.vehiculoId);
  }

  private cargarVehiculo(id: number): void {
    this.loading = true;
    this.errorMessage = '';

    this.vehiculosService.getVehiculoById(id).subscribe({
      next: (data: Vehiculo) => {
        this.vehiculo = {
          id: data.id,
          nombreVehiculo: data.nombreVehiculo,
          marca: data.marca,
          modelo: data.modelo,
          anio: data.anio ?? null,
          tipoVehiculo: data.tipoVehiculo,
          statusVehiculo: data.statusInicial as StatusVehiculo,
          grupo: data.grupo ?? '',
          division: data.division ?? '',
          numeroSerie: data.numeroSerie ?? '',
          placa: data.placa ?? '',
          color: data.color ?? '',
          companiaSeguros: data.companiaSeguros ?? '',
          polizaSeguro: data.polizaSeguro ?? '',
          vigenciaPoliza: '',
          inicioEstadisticas: (data.inicioEstadisticas as 'Fecha de registro' | 'Fecha de compra' | '') ?? '',
          medidaUso: (data.medidaUso as 'Kilómetros' | 'Millas' | 'Horas' | '') ?? '',
          medidaCombustible: (data.medidaCombustible as 'Litros' | 'Galones' | '') ?? '',
        };

        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar detalle del vehículo:', error);
        this.errorMessage = error?.error?.mensaje || 'No se pudo cargar el vehículo.';
        this.loading = false;
      }
    });
  }

  statusBadgeClass(s: StatusVehiculo): string {
    if (s === 'Disponible') return 'bg-green-100 text-green-700';
    if (s === 'Asignado') return 'bg-blue-100 text-blue-700';
    if (s === 'Fuera de Servicio') return 'bg-slate-200 text-slate-700';
    return 'bg-amber-100 text-amber-700';
  }

  safeText(v?: string | number | null): string {
    if (v === null || v === undefined) return '—';
    const s = String(v).trim();
    return s.length ? s : '—';
  }

  onRegresar(): void {
    this.router.navigate(['/vehiculos']);
  }

  onEditar(): void {
    if (!this.vehiculo) return;
    this.router.navigate(['/vehiculos', this.vehiculo.id, 'editar']);
  }

  onVerDocumentos(): void {
    if (!this.vehiculo) return;
    this.router.navigate(['/vehiculos', this.vehiculo.id, 'documentos']);
  }
}