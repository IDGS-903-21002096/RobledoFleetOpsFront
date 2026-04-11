import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { CabeceraComponent } from '../../components/cabecera/cabecera';
import { FooterComponent } from '../../components/footer/footer';

import {
  ArticulosInventarioService,
  ArticuloInventario
} from '../../../services/articulos-inventario.service';

import { EntradasInventarioService } from '../../../services/entradas-inventario.service';
import { SalidasInventarioService } from '../../../services/salidas-inventario.service';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule, CabeceraComponent, FooterComponent],
  templateUrl: './inventario.html',
})
export class InventarioComponent implements OnInit {

  private service = inject(ArticulosInventarioService);
  private entradasService = inject(EntradasInventarioService);
  private salidasService = inject(SalidasInventarioService);
  private router = inject(Router);

  items: ArticuloInventario[] = [];
  itemsFiltrados: ArticuloInventario[] = [];
  itemsPaginados: ArticuloInventario[] = [];

  grupos: string[] = [];

  busqueda = '';
  filtroGrupo = '';

  page = 1;
  pageSize = 5;

  loading = false;
  errorMessage = '';

  Math = Math;

  kpiEntradas = 0;
  kpiSalidas = 0;

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.loading = true;
    this.errorMessage = '';

    forkJoin({
      articulos: this.service.getArticulosActivos(),
      resumenEntradas: this.entradasService.getResumen(),
      resumenSalidas: this.salidasService.getResumen()
    }).subscribe({
      next: ({ articulos, resumenEntradas, resumenSalidas }) => {
        this.items = articulos ?? [];
        this.grupos = Array.from(new Set(this.items.map(x => x.grupo)));

        this.kpiEntradas = resumenEntradas?.costoTotalEntradas ?? 0;
        this.kpiSalidas = resumenSalidas?.costoTotalSalidas ?? 0;

        this.aplicarFiltros();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar inventario:', error);
        this.errorMessage = this.getLoadErrorMessage(error, 'el inventario');
        this.items = [];
        this.itemsFiltrados = [];
        this.itemsPaginados = [];
        this.grupos = [];
        this.kpiEntradas = 0;
        this.kpiSalidas = 0;
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

  get kpiValorInventario(): number {
    return this.items.reduce((acc, x) => acc + (x.existencia * x.costoPromedio), 0);
  }

  aplicarFiltros(): void {
    const q = this.busqueda.toLowerCase();

    this.itemsFiltrados = this.items.filter(it =>
      (!this.filtroGrupo || it.grupo === this.filtroGrupo) &&
      (!q ||
        it.codigo.toLowerCase().includes(q) ||
        it.nombre.toLowerCase().includes(q) ||
        (it.descripcion || '').toLowerCase().includes(q))
    );

    this.page = 1;
    this.refrescarPaginado();
  }

  refrescarPaginado(): void {
    const start = (this.page - 1) * this.pageSize;
    this.itemsPaginados = this.itemsFiltrados.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.itemsFiltrados.length / this.pageSize) || 1;
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

  estatusTexto(it: ArticuloInventario): string {
    if (!it.activo) return 'Inactivo';
    if (it.existencia === 0) return 'Sin stock';
    if (it.puntoReorden && it.existencia <= it.puntoReorden) return 'Stock bajo';
    return 'Activo';
  }

  badgeClass(it: ArticuloInventario): string {
    if (!it.activo) {
      return 'inline-flex items-center rounded-full bg-gray-200 px-2.5 py-1 text-xs font-medium text-gray-700';
    }

    if (it.existencia === 0) {
      return 'inline-flex items-center rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700';
    }

    if (it.puntoReorden && it.existencia <= it.puntoReorden) {
      return 'inline-flex items-center rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700';
    }

    return 'inline-flex items-center rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700';
  }

  onRegistrarArticulo(): void {
    this.router.navigate(['/inventario/nuevo']);
  }

  onEditar(it: ArticuloInventario): void {
    this.router.navigate(['/inventario', it.id, 'editar']);
  }

  onInactivar(it: ArticuloInventario): void {
    if (!confirm('¿Inactivar artículo?')) return;

    this.service.inactivarArticulo(it.id).subscribe(() => {
      this.cargarDatos();
    });
  }

  onReactivar(it: ArticuloInventario): void {
    this.service.reactivarArticulo(it.id).subscribe(() => {
      this.cargarDatos();
    });
  }
}