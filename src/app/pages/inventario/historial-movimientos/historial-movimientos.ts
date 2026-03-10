import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CabeceraComponent } from '../../../components/cabecera/cabecera';
import { FooterComponent } from '../../../components/footer/footer';

type Unidad = 'pz' | 'lt' | 'kg' | 'm' | 'jgo';
type TipoMovimiento = 'ENTRADA' | 'SALIDA';

interface MovimientoInventario {
  folio: string;
  fecha: string;
  tipo: TipoMovimiento;
  detalleTipo: string;
  codigoArticulo: string;
  articulo: string;
  grupo: string;
  unidad: Unidad;
  cantidad: number;
  costoUnitario: number;
  costoTotal: number;
  proveedor?: string;
  responsable?: string;
  referencia: string;
  observaciones: string;
  usuario: string;
}

@Component({
  selector: 'app-historial-movimientos',
  standalone: true,
  imports: [CommonModule, FormsModule, CabeceraComponent, FooterComponent],
  templateUrl: './historial-movimientos.html',
  styleUrl: './historial-movimientos.scss',
})
export class HistorialMovimientosComponent {
  movimientos: MovimientoInventario[] = [
    {
      folio: 'ENT-0001',
      fecha: '2026-03-02',
      tipo: 'ENTRADA',
      detalleTipo: 'COMPRA',
      codigoArticulo: 'L020',
      articulo: 'Aceite 15W-40',
      grupo: 'LUBRICANTE',
      unidad: 'lt',
      cantidad: 20,
      costoUnitario: 98.5,
      costoTotal: 1970,
      proveedor: 'Lubricantes del Bajío',
      referencia: 'FAC-1048',
      observaciones: 'Compra para stock semanal.',
      usuario: 'Jorge Rangel',
    },
    {
      folio: 'SAL-0001',
      fecha: '2026-03-03',
      tipo: 'SALIDA',
      detalleTipo: 'DAÑO',
      codigoArticulo: 'R310',
      articulo: 'Filtro de aire',
      grupo: 'REFACCIÓN',
      unidad: 'pz',
      cantidad: 1,
      costoUnitario: 420,
      costoTotal: 420,
      responsable: 'Almacén',
      referencia: 'INC-003',
      observaciones: 'Filtro dañado durante revisión de almacén.',
      usuario: 'Jorge Rangel',
    },
    {
      folio: 'ENT-0002',
      fecha: '2026-03-04',
      tipo: 'ENTRADA',
      detalleTipo: 'COMPRA',
      codigoArticulo: 'R310',
      articulo: 'Filtro de aire',
      grupo: 'REFACCIÓN',
      unidad: 'pz',
      cantidad: 10,
      costoUnitario: 420,
      costoTotal: 4200,
      proveedor: 'Refacciones León',
      referencia: 'REM-8821',
      observaciones: 'Ingreso por compra general.',
      usuario: 'Administrador',
    },
    {
      folio: 'SAL-0002',
      fecha: '2026-03-05',
      tipo: 'SALIDA',
      detalleTipo: 'CONSUMO INTERNO',
      codigoArticulo: 'L020',
      articulo: 'Aceite 15W-40',
      grupo: 'LUBRICANTE',
      unidad: 'lt',
      cantidad: 2,
      costoUnitario: 98.5,
      costoTotal: 197,
      responsable: 'Mantenimiento',
      referencia: 'INT-009',
      observaciones: 'Consumo interno para pruebas operativas.',
      usuario: 'Administrador',
    },
    {
      folio: 'ENT-0003',
      fecha: '2026-03-06',
      tipo: 'ENTRADA',
      detalleTipo: 'AJUSTE POSITIVO',
      codigoArticulo: 'H001',
      articulo: 'Pistola de Pintura',
      grupo: 'HERRAMIENTA',
      unidad: 'pz',
      cantidad: 1,
      costoUnitario: 1250,
      costoTotal: 1250,
      proveedor: 'Herramientas Industriales del Centro',
      referencia: 'AJ-001',
      observaciones: 'Regularización por conteo físico.',
      usuario: 'Supervisor almacén',
    },
    {
      folio: 'SAL-0003',
      fecha: '2026-03-06',
      tipo: 'SALIDA',
      detalleTipo: 'MERMA',
      codigoArticulo: 'S777',
      articulo: 'Sellador silicón',
      grupo: 'CONSUMIBLE',
      unidad: 'pz',
      cantidad: 1,
      costoUnitario: 55,
      costoTotal: 55,
      responsable: 'Almacén',
      referencia: 'MER-001',
      observaciones: 'Empaque abierto y no utilizable.',
      usuario: 'Supervisor almacén',
    },
  ];

  busqueda = '';
  filtroTipo = '';
  filtroGrupo = '';
  fechaDesde = '';
  fechaHasta = '';

  grupos: string[] = [];

  page = 1;
  pageSize = 10;

  movimientosFiltrados: MovimientoInventario[] = [];
  movimientosPaginados: MovimientoInventario[] = [];

  mostrarModalDetalle = false;
  movimientoSeleccionado: MovimientoInventario | null = null;

  constructor() {
    this.grupos = Array.from(new Set(this.movimientos.map(x => x.grupo))).sort();
    this.aplicarFiltros();
  }

  get totalMovimientos(): number {
    return this.movimientosFiltrados.length;
  }

  get totalEntradas(): number {
    return this.movimientosFiltrados.filter(x => x.tipo === 'ENTRADA').length;
  }

  get totalSalidas(): number {
    return this.movimientosFiltrados.filter(x => x.tipo === 'SALIDA').length;
  }

  get valorTotalMovido(): number {
    return this.movimientosFiltrados.reduce((acc, item) => acc + item.costoTotal, 0);
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

  private toText(v: unknown): string {
    return v === null || v === undefined ? '' : String(v).toLowerCase();
  }

  aplicarFiltros(): void {
    const q = (this.busqueda || '').trim().toLowerCase();
    const tipo = (this.filtroTipo || '').trim().toLowerCase();
    const grupo = (this.filtroGrupo || '').trim().toLowerCase();
    const desde = this.fechaDesde || '';
    const hasta = this.fechaHasta || '';

    this.movimientosFiltrados = this.movimientos.filter(item => {
      const matchTipo = !tipo || this.toText(item.tipo) === tipo;
      const matchGrupo = !grupo || this.toText(item.grupo) === grupo;

      const matchFechaDesde = !desde || item.fecha >= desde;
      const matchFechaHasta = !hasta || item.fecha <= hasta;

      const matchQuery =
        !q ||
        [
          item.folio,
          item.fecha,
          item.tipo,
          item.detalleTipo,
          item.codigoArticulo,
          item.articulo,
          item.grupo,
          item.unidad,
          item.cantidad,
          item.costoUnitario,
          item.costoTotal,
          item.proveedor ?? '',
          item.responsable ?? '',
          item.referencia,
          item.observaciones,
          item.usuario,
        ]
          .map(v => this.toText(v))
          .some(txt => txt.includes(q));

      return matchTipo && matchGrupo && matchFechaDesde && matchFechaHasta && matchQuery;
    });

    this.movimientosFiltrados = [...this.movimientosFiltrados].sort((a, b) => {
      if (a.fecha === b.fecha) return b.folio.localeCompare(a.folio);
      return b.fecha.localeCompare(a.fecha);
    });

    this.page = Math.min(this.page, this.totalPages);
    this.page = Math.max(1, this.page);

    this.refrescarPaginado();
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
    return item.folio;
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