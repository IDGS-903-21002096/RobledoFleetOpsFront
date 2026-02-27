import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { CabeceraComponent } from '../../components/cabecera/cabecera';
import { FooterComponent } from '../../components/footer/footer';

type EstatusVehiculo = 'Asignado' | 'Disponible' | 'En taller';

type VehiculoCard = {
  id: number;
  nombre: string;
  tipo: string;
  grupo?: string;
  placa?: string;
  estatus: EstatusVehiculo;
};

@Component({
  selector: 'app-vehiculos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CabeceraComponent, FooterComponent],
  templateUrl: './vehiculos.html',
})
export class VehiculosComponent {
  search = '';
  pageSize = 12;
  vehiculos: VehiculoCard[] = [
    { id: 1, nombre: 'Unidad 01', tipo: 'Autobús', grupo: 'BUS', placa: 'GTO-123-A', estatus: 'Asignado' },
    { id: 2, nombre: 'Unidad 02', tipo: 'Van', grupo: 'SPRINTER', placa: 'GTO-456-B', estatus: 'Disponible' },
    { id: 3, nombre: 'Unidad 03', tipo: 'Camioneta', grupo: 'URVAN', placa: 'GTO-789-C', estatus: 'En taller' },
  ];

  constructor(private router: Router) {}

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
    console.log('Eliminar vehículo', v);
  }
}
