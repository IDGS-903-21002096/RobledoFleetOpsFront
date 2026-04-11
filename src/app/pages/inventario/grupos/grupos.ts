import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { CabeceraComponent } from '../../../components/cabecera/cabecera';
import { FooterComponent } from '../../../components/footer/footer';
import {
  GrupoInventario,
  GruposInventarioService
} from '../../../../services/grupos-inventario.service';

type EstadoFiltro = 'ACTIVOS' | 'INACTIVOS';

@Component({
  selector: 'app-grupos',
  standalone: true,
  imports: [CommonModule, RouterModule, CabeceraComponent, FooterComponent],
  templateUrl: './grupos.html',
  styleUrl: './grupos.scss',
})
export class GruposComponent implements OnInit {
  private router = inject(Router);
  private gruposInventarioService = inject(GruposInventarioService);

  grupos: GrupoInventario[] = [];
  gruposPaginados: GrupoInventario[] = [];

  loading = false;
  errorMessage = '';

  estadoFiltro: EstadoFiltro = 'ACTIVOS';

  page = 1;
  pageSize = 5;

  Math = Math;

  ngOnInit(): void {
    this.cargarGrupos();
  }

  cargarGrupos(): void {
    this.loading = true;
    this.errorMessage = '';

    const request$ =
      this.estadoFiltro === 'ACTIVOS'
        ? this.gruposInventarioService.getGruposActivos()
        : this.gruposInventarioService.getGruposInactivos();

    request$.subscribe({
      next: (data) => {
        this.grupos = (data ?? []).sort((a, b) => a.id - b.id);
        this.page = 1;
        this.refrescarPaginado();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar grupos de artículos:', error);
        this.errorMessage = error?.error?.mensaje || 'No se pudieron cargar los grupos.';
        this.grupos = [];
        this.gruposPaginados = [];
        this.page = 1;
        this.loading = false;
      }
    });
  }

  refrescarPaginado(): void {
    const start = (this.page - 1) * this.pageSize;
    this.gruposPaginados = this.grupos.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.grupos.length / this.pageSize) || 1;
  }

  prevPage(): void {
    if (this.page > 1) {
      this.page--;
      this.refrescarPaginado();
    }
  }

  nextPage(): void {
    if (this.page < this.totalPages) {
      this.page++;
      this.refrescarPaginado();
    }
  }

  onCambiarFiltro(estado: EstadoFiltro): void {
    if (this.estadoFiltro === estado) return;
    this.estadoFiltro = estado;
    this.cargarGrupos();
  }

  onAgregarGrupo(): void {
    this.router.navigate(['/inventario/grupos/nuevo']);
  }

  onActualizar(grupo: GrupoInventario): void {
    this.router.navigate(['/inventario/grupos', grupo.id, 'editar']);
  }

  onEliminar(grupo: GrupoInventario): void {
    const confirmar = confirm(`¿Deseas inactivar el grupo "${grupo.nombre}"?`);
    if (!confirmar) return;

    this.gruposInventarioService.inactivarGrupo(grupo.id).subscribe({
      next: () => {
        this.cargarGrupos();
      },
      error: (error) => {
        console.error('Error al inactivar grupo:', error);
        alert(error?.error?.mensaje || 'No se pudo inactivar el grupo.');
      }
    });
  }

  onReactivar(grupo: GrupoInventario): void {
    const confirmar = confirm(`¿Deseas reactivar el grupo "${grupo.nombre}"?`);
    if (!confirmar) return;

    this.gruposInventarioService.reactivarGrupo(grupo.id).subscribe({
      next: () => {
        this.cargarGrupos();
      },
      error: (error) => {
        console.error('Error al reactivar grupo:', error);
        alert(error?.error?.mensaje || 'No se pudo reactivar el grupo.');
      }
    });
  }
}