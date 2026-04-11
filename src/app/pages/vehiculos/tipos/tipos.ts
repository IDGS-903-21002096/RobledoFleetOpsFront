import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { CabeceraComponent } from '../../../components/cabecera/cabecera';
import { FooterComponent } from '../../../components/footer/footer';
import { TipoVehiculo, TiposVehiculoService } from '../../../../services/tipos-vehiculo.service';

@Component({
  selector: 'app-tipos',
  standalone: true,
  imports: [CommonModule, FormsModule, CabeceraComponent, FooterComponent],
  templateUrl: './tipos.html',
  styleUrl: './tipos.scss',
})
export class TiposComponent implements OnInit {
  private router = inject(Router);
  private tiposVehiculoService = inject(TiposVehiculoService);

  search: string = '';
  loading: boolean = false;
  errorMessage: string = '';

  isDetalleOpen: boolean = false;
  selectedTipo: TipoVehiculo | null = null;

  tipos: TipoVehiculo[] = [];

  ngOnInit(): void {
    this.cargarTipos();
  }

  cargarTipos(): void {
    this.loading = true;
    this.errorMessage = '';

    this.tiposVehiculoService.getTipos().subscribe({
      next: (data) => {
        this.tipos = data ?? [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar tipos de vehículo:', error);
        this.errorMessage = 'No se pudieron cargar los tipos de vehículo.';
        this.loading = false;
      }
    });
  }

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

    const request$ = t.activo
      ? this.tiposVehiculoService.inactivarTipo(t.id)
      : this.tiposVehiculoService.reactivarTipo(t.id);

    request$.subscribe({
      next: () => {
        if (this.selectedTipo?.id === t.id) {
          this.closeDetalle();
        }
        this.cargarTipos();
      },
      error: (error) => {
        console.error('Error al cambiar estado del tipo:', error);
        alert(error?.error?.mensaje || 'No se pudo cambiar el estado del tipo.');
      }
    });
  }
}