import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { CabeceraComponent } from '../../../components/cabecera/cabecera';
import { FooterComponent } from '../../../components/footer/footer';

interface TipoVehiculo {
  id: number;
  nombre: string;
  descripcion: string;
  enUso: number;
  activo: boolean;
}

@Component({
  selector: 'app-tipos',
  standalone: true,
  imports: [CommonModule, FormsModule, CabeceraComponent, FooterComponent],
  templateUrl: './tipos.html',
  styleUrl: './tipos.scss',
})
export class TiposComponent {
  constructor(private router: Router) {}

  search: string = '';

  isDetalleOpen: boolean = false;
  selectedTipo: TipoVehiculo | null = null;

  tipos: TipoVehiculo[] = [
    { id: 1, nombre: 'Automóvil', descripcion: 'Vehículo ligero.', enUso: 10, activo: true },
    { id: 2, nombre: 'Camioneta', descripcion: 'Unidades tipo pickup/van.', enUso: 7, activo: true },
    { id: 3, nombre: 'Autobús', descripcion: 'Transporte de personal.', enUso: 24, activo: true },
    { id: 4, nombre: 'Camión', descripcion: 'Carga ligera/mediana.', enUso: 3, activo: true },
    { id: 5, nombre: 'Van', descripcion: 'Unidades van.', enUso: 26, activo: true },
    { id: 6, nombre: 'Tráiler', descripcion: 'Unidad articulada.', enUso: 12, activo: true },
  ];

  private normalize(text: string): string {
    return (text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  filteredTipos(): TipoVehiculo[] {
    const q = this.normalize(this.search);

    return this.tipos
      .filter((t) => {
        if (!q) return true;
        const hay = this.normalize(`${t.nombre} ${t.descripcion}`);
        return hay.includes(q);
      })
      .sort((a, b) => {
        if (a.activo !== b.activo) return a.activo ? -1 : 1;
        return a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' });
      });
  }

  openDetalle(t: TipoVehiculo): void {
    this.selectedTipo = t;
    this.isDetalleOpen = true;
  }

  closeDetalle(): void {
    this.isDetalleOpen = false;
    this.selectedTipo = null;
  }

  onCrearTipo(): void {
    this.router.navigate(['/vehiculos/tipos/nuevo']);
  }

  onEditar(t: TipoVehiculo): void {
    this.router.navigate(['/vehiculos/tipos', t.id, 'editar']);
  }

  onToggleEstado(t: TipoVehiculo): void {
    if (t.activo && t.enUso > 0) {
      alert('No puedes desactivar un tipo que está en uso.');
      return;
    }

    t.activo = !t.activo;
  }
}