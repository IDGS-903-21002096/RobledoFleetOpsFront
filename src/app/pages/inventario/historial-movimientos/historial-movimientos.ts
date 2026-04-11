import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CabeceraComponent } from '../../../components/cabecera/cabecera';
import { FooterComponent } from '../../../components/footer/footer';

import {
  HistorialMovimientosResumen,
  HistorialMovimientosService,
  MovimientoInventario
} from '../../../../services/historial-movimientos.service';

@Component({
  selector: 'app-historial-movimientos',
  standalone: true,
  imports: [CommonModule, FormsModule, CabeceraComponent, FooterComponent],
  templateUrl: './historial-movimientos.html',
  styleUrl: './historial-movimientos.scss',
})
export class HistorialMovimientosComponent implements OnInit {
  private historialService = inject(HistorialMovimientosService);

  busqueda = '';
  filtroTipo = '';
  filtroGrupo = '';
  fechaDesde = '';
  fechaHasta = '';

  grupos: string[] = [];

  page = 1;
  pageSize = 5;

  movimientos: MovimientoInventario[] = [];
  movimientosFiltrados: MovimientoInventario[] = [];
  movimientosPaginados: MovimientoInventario[] = [];

  resumen: HistorialMovimientosResumen = {
    totalMovimientos: 0,
    totalEntradas: 0,
    totalSalidas: 0,
    valorTotalMovido: 0,
  };

  mostrarModalDetalle = false;
  movimientoSeleccionado: MovimientoInventario | null = null;

  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.cargarMovimientos();
  }

  get totalMovimientos(): number {
    return this.resumen.totalMovimientos;
  }

  get totalEntradas(): number {
    return this.resumen.totalEntradas;
  }

  get totalSalidas(): number {
    return this.resumen.totalSalidas;
  }

  get valorTotalMovido(): number {
    return this.resumen.valorTotalMovido;
  }

  get totalPages(): number {
    const total = this.movimientosFiltrados.length;
    return Math.max(1, Math.ceil(total / this.pageSize));
  }

  get inicioRango(): number {
    const total = this.movimientosFiltrados.length;
    if (total === 0) return 0;
    return (this.page - 1) * this.pageSize + 1;
  }

  get finRango(): number {
    const total = this.movimientosFiltrados.length;
    if (total === 0) return 0;
    return Math.min(this.page * this.pageSize, total);
  }

  private buildFilters() {
    return {
      busqueda: this.busqueda,
      tipo: this.filtroTipo,
      grupo: this.filtroGrupo,
      fechaDesde: this.fechaDesde,
      fechaHasta: this.fechaHasta,
    };
  }

  cargarMovimientos(): void {
    this.loading = true;
    this.errorMessage = '';

    const filters = this.buildFilters();

    this.historialService.getMovimientos(filters).subscribe({
      next: (data) => {
        this.movimientos = data ?? [];
        this.movimientosFiltrados = [...this.movimientos];
        this.page = 1;
        this.grupos = Array.from(new Set(this.movimientos.map(x => x.grupo))).sort();
        this.refrescarPaginado();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar historial de movimientos:', error);
        this.errorMessage = error?.error?.mensaje || 'No se pudo cargar el historial de movimientos.';
        this.movimientos = [];
        this.movimientosFiltrados = [];
        this.movimientosPaginados = [];
        this.grupos = [];
        this.loading = false;
      }
    });

    this.historialService.getResumen(filters).subscribe({
      next: (data) => {
        this.resumen = data ?? {
          totalMovimientos: 0,
          totalEntradas: 0,
          totalSalidas: 0,
          valorTotalMovido: 0,
        };
      },
      error: (error) => {
        console.error('Error al cargar resumen del historial:', error);
      }
    });
  }

  aplicarFiltros(): void {
    this.cargarMovimientos();
  }

  limpiarFiltros(): void {
    this.busqueda = '';
    this.filtroTipo = '';
    this.filtroGrupo = '';
    this.fechaDesde = '';
    this.fechaHasta = '';
    this.cargarMovimientos();
  }

  refrescarPaginado(): void {
    const start = (this.page - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.movimientosPaginados = this.movimientosFiltrados.slice(start, end);
  }

  cambiarPageSize(): void {
    this.page = 1;
    this.refrescarPaginado();
  }

  prevPage(): void {
    if (this.page <= 1) return;
    this.page -= 1;
    this.refrescarPaginado();
  }

  nextPage(): void {
    if (this.page >= this.totalPages) return;
    this.page += 1;
    this.refrescarPaginado();
  }

  trackByFolio(_: number, item: MovimientoInventario): string {
    return `${item.tipo}-${item.folio}`;
  }

  onVerDetalle(item: MovimientoInventario): void {
    this.movimientoSeleccionado = item;
    this.mostrarModalDetalle = true;
  }

  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
    this.movimientoSeleccionado = null;
  }
}