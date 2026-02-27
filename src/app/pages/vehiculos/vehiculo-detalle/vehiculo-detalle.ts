import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { CabeceraComponent } from '../../../components/cabecera/cabecera';
import { FooterComponent } from '../../../components/footer/footer';

type StatusVehiculo = 'Asignado' | 'Disponible' | 'En taller';

type VehiculoDetalle = {
  id: number;
  nombreVehiculo: string;
  marca: string;
  modelo: string;
  anio: number | null;
  tipoVehiculo: string;
  statusVehiculo: StatusVehiculo;
  grupo?: string;
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
export class VehiculoDetalleComponent {
  vehiculoId: number | null = null;

  vehiculo: VehiculoDetalle | null = null;

  private readonly mockVehiculos: VehiculoDetalle[] = [
    {
      id: 1,
      nombreVehiculo: 'Unidad 12',
      marca: 'Mercedes',
      modelo: 'Sprinter',
      anio: 2022,
      tipoVehiculo: 'Autobús',
      statusVehiculo: 'Asignado',
      grupo: 'Autobuses',
      placa: 'GTO-123-A',
      numeroSerie: '1HGCM82633A123456',
      color: 'Blanco',
      companiaSeguros: 'Qualitas',
      polizaSeguro: 'POL-00012345',
      vigenciaPoliza: '2026-12-31',
      inicioEstadisticas: 'Fecha de compra',
      medidaUso: 'Kilómetros',
      medidaCombustible: 'Litros',
    },
    {
      id: 2,
      nombreVehiculo: 'Unidad 08',
      marca: 'Nissan',
      modelo: 'Urvan',
      anio: 2021,
      tipoVehiculo: 'Camioneta',
      statusVehiculo: 'En taller',
      inicioEstadisticas: 'Fecha de registro',
      medidaUso: 'Kilómetros',
      medidaCombustible: 'Litros',
    },
    {
      id: 3,
      nombreVehiculo: 'Unidad 20',
      marca: 'Ford',
      modelo: 'Transit',
      anio: 2023,
      tipoVehiculo: 'Camioneta',
      statusVehiculo: 'Disponible',
    },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.vehiculoId = idParam ? Number(idParam) : null;

    if (this.vehiculoId && !Number.isNaN(this.vehiculoId)) {
      this.vehiculo = this.mockVehiculos.find((v) => v.id === this.vehiculoId) ?? null;
    }
  }

  statusBadgeClass(s: StatusVehiculo): string {
    if (s === 'Disponible') return 'bg-green-100 text-green-700';
    if (s === 'Asignado') return 'bg-blue-100 text-blue-700';
    return 'bg-amber-100 text-amber-700';
  }

  formatDate(v?: string): string {
    return v?.trim() ? v : '—';
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
