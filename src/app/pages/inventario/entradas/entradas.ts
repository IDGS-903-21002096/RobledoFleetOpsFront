import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CabeceraComponent } from '../../../components/cabecera/cabecera';
import { FooterComponent } from '../../../components/footer/footer';

type Unidad = 'pz' | 'lt' | 'kg' | 'm' | 'jgo';
type TipoEntrada = 'COMPRA' | 'DEVOLUCIÓN' | 'INVENTARIO INICIAL' | 'AJUSTE POSITIVO';

interface ArticuloInventario {
  codigo: string;
  nombre: string;
  grupo: string;
  unidad: Unidad;
}

interface EntradaInventario {
  folio: string;
  fecha: string;
  codigoArticulo: string;
  articulo: string;
  grupo: string;
  unidad: Unidad;
  cantidad: number;
  costoUnitario: number;
  costoTotal: number;
  proveedor: string;
  tipoEntrada: TipoEntrada;
  referencia: string;
  observaciones: string;
  usuario: string;
}

@Component({
  selector: 'app-entradas',
  standalone: true,
  imports: [CommonModule, FormsModule, CabeceraComponent, FooterComponent],
  templateUrl: './entradas.html',
  styleUrl: './entradas.scss',
})
export class EntradasComponent {
  articulos: ArticuloInventario[] = [
    { codigo: 'G141', nombre: 'Disco de lija 6" X 6 G100', grupo: 'HERRAMIENTA', unidad: 'pz' },
    { codigo: 'H001', nombre: 'Pistola de Pintura', grupo: 'HERRAMIENTA', unidad: 'pz' },
    { codigo: 'L020', nombre: 'Aceite 15W-40', grupo: 'LUBRICANTE', unidad: 'lt' },
    { codigo: 'R310', nombre: 'Filtro de aire', grupo: 'REFACCIÓN', unidad: 'pz' },
    { codigo: 'S777', nombre: 'Sellador silicón', grupo: 'CONSUMIBLE', unidad: 'pz' },
  ];

  tiposEntrada: TipoEntrada[] = [
    'COMPRA',
    'DEVOLUCIÓN',
    'INVENTARIO INICIAL',
    'AJUSTE POSITIVO',
  ];

  entradas: EntradaInventario[] = [
    {
      folio: 'ENT-0001',
      fecha: '2026-03-02',
      codigoArticulo: 'L020',
      articulo: 'Aceite 15W-40',
      grupo: 'LUBRICANTE',
      unidad: 'lt',
      cantidad: 20,
      costoUnitario: 98.5,
      costoTotal: 1970,
      proveedor: 'Lubricantes del Bajío',
      tipoEntrada: 'COMPRA',
      referencia: 'FAC-1048',
      observaciones: 'Compra para stock semanal.',
      usuario: 'Jorge Rangel',
    },
    {
      folio: 'ENT-0002',
      fecha: '2026-03-04',
      codigoArticulo: 'R310',
      articulo: 'Filtro de aire',
      grupo: 'REFACCIÓN',
      unidad: 'pz',
      cantidad: 10,
      costoUnitario: 420,
      costoTotal: 4200,
      proveedor: 'Refacciones León',
      tipoEntrada: 'COMPRA',
      referencia: 'REM-8821',
      observaciones: 'Ingreso por compra general.',
      usuario: 'Administrador',
    },
    {
      folio: 'ENT-0003',
      fecha: '2026-03-06',
      codigoArticulo: 'H001',
      articulo: 'Pistola de Pintura',
      grupo: 'HERRAMIENTA',
      unidad: 'pz',
      cantidad: 1,
      costoUnitario: 1250,
      costoTotal: 1250,
      proveedor: 'Herramientas Industriales del Centro',
      tipoEntrada: 'AJUSTE POSITIVO',
      referencia: 'AJ-001',
      observaciones: 'Regularización por conteo físico.',
      usuario: 'Supervisor almacén',
    },
  ];

  form = {
    fecha: this.hoyISO(),
    codigoArticulo: '',
    cantidad: null as number | null,
    costoUnitario: null as number | null,
    proveedor: '',
    tipoEntrada: 'COMPRA' as TipoEntrada,
    referencia: '',
    observaciones: '',
    usuario: '',
  };

  busqueda = '';
  filtroTipo = '';

  page = 1;
  pageSize = 10;

  mostrarFormulario = true;

  entradasFiltradas: EntradaInventario[] = [];
  entradasPaginadas: EntradaInventario[] = [];

  mostrarModalDetalle = false;
  entradaSeleccionada: EntradaInventario | null = null;

  constructor() {
    this.aplicarFiltros();
  }

  get articuloSeleccionado(): ArticuloInventario | undefined {
    return this.articulos.find(a => a.codigo === this.form.codigoArticulo);
  }

  get totalFormulario(): number {
    const cantidad = Number(this.form.cantidad || 0);
    const costo = Number(this.form.costoUnitario || 0);
    return cantidad * costo;
  }

  get totalEntradas(): number {
    return this.entradasFiltradas.length;
  }

  get cantidadTotalIngresada(): number {
    return this.entradasFiltradas.reduce((acc, item) => acc + item.cantidad, 0);
  }

  get costoTotalEntradas(): number {
    return this.entradasFiltradas.reduce((acc, item) => acc + item.costoTotal, 0);
  }

  get totalPages(): number {
    const total = this.entradasFiltradas.length;
    return Math.max(1, Math.ceil(total / this.pageSize));
  }

  get inicioRango(): number {
    const total = this.entradasFiltradas.length;
    if (total === 0) return 0;
    return (this.page - 1) * this.pageSize + 1;
  }

  get finRango(): number {
    const total = this.entradasFiltradas.length;
    if (total === 0) return 0;
    return Math.min(this.page * this.pageSize, total);
  }

  private hoyISO(): string {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, '0');
    const day = String(hoy.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private toText(v: unknown): string {
    return v === null || v === undefined ? '' : String(v).toLowerCase();
  }

  toggleFormulario(): void {
    this.mostrarFormulario = !this.mostrarFormulario;
  }

  onArticuloChange(): void {
    // Reservado para lógica futura
  }

  guardarEntrada(): void {
    if (!this.form.fecha) {
      alert('Debes seleccionar la fecha de la entrada.');
      return;
    }

    if (!this.form.codigoArticulo) {
      alert('Debes seleccionar un artículo.');
      return;
    }

    if (this.form.cantidad === null || this.form.cantidad <= 0) {
      alert('Debes capturar una cantidad válida.');
      return;
    }

    if (this.form.costoUnitario === null || this.form.costoUnitario < 0) {
      alert('Debes capturar un costo unitario válido.');
      return;
    }

    const articulo = this.articuloSeleccionado;
    if (!articulo) {
      alert('No se encontró el artículo seleccionado.');
      return;
    }

    const nuevaEntrada: EntradaInventario = {
      folio: this.generarFolio(),
      fecha: this.form.fecha,
      codigoArticulo: articulo.codigo,
      articulo: articulo.nombre,
      grupo: articulo.grupo,
      unidad: articulo.unidad,
      cantidad: Number(this.form.cantidad),
      costoUnitario: Number(this.form.costoUnitario),
      costoTotal: Number(this.form.cantidad) * Number(this.form.costoUnitario),
      proveedor: this.form.proveedor.trim(),
      tipoEntrada: this.form.tipoEntrada,
      referencia: this.form.referencia.trim(),
      observaciones: this.form.observaciones.trim(),
      usuario: this.form.usuario.trim(),
    };

    this.entradas = [nuevaEntrada, ...this.entradas];
    this.limpiarFormulario(false);
    this.aplicarFiltros();
    this.mostrarFormulario = false;

    alert(`Entrada ${nuevaEntrada.folio} registrada correctamente (mock).`);
  }

  limpiarFormulario(resetFecha: boolean = true): void {
    this.form = {
      fecha: resetFecha ? this.hoyISO() : this.form.fecha,
      codigoArticulo: '',
      cantidad: null,
      costoUnitario: null,
      proveedor: '',
      tipoEntrada: 'COMPRA',
      referencia: '',
      observaciones: '',
      usuario: '',
    };
  }

  aplicarFiltros(): void {
    const q = (this.busqueda || '').trim().toLowerCase();
    const tipo = (this.filtroTipo || '').trim().toLowerCase();

    this.entradasFiltradas = this.entradas.filter(item => {
      const matchTipo = !tipo || this.toText(item.tipoEntrada) === tipo;

      const matchQuery =
        !q ||
        [
          item.folio,
          item.fecha,
          item.codigoArticulo,
          item.articulo,
          item.grupo,
          item.unidad,
          item.cantidad,
          item.costoUnitario,
          item.costoTotal,
          item.proveedor,
          item.tipoEntrada,
          item.referencia,
          item.observaciones,
          item.usuario,
        ]
          .map(v => this.toText(v))
          .some(txt => txt.includes(q));

      return matchTipo && matchQuery;
    });

    this.page = Math.min(this.page, this.totalPages);
    this.page = Math.max(1, this.page);

    this.refrescarPaginado();
  }

  refrescarPaginado(): void {
    const start = (this.page - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.entradasPaginadas = this.entradasFiltradas.slice(start, end);
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

  trackByFolio(_: number, item: EntradaInventario): string {
    return item.folio;
  }

  onVerDetalle(item: EntradaInventario): void {
    this.entradaSeleccionada = item;
    this.mostrarModalDetalle = true;
  }

  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
    this.entradaSeleccionada = null;
  }

  onEliminar(item: EntradaInventario): void {
    const ok = confirm(`¿Eliminar la entrada ${item.folio} del artículo ${item.articulo}?`);
    if (!ok) return;

    this.entradas = this.entradas.filter(x => x.folio !== item.folio);

    if (this.entradaSeleccionada?.folio === item.folio) {
      this.cerrarModalDetalle();
    }

    this.aplicarFiltros();
  }

  private generarFolio(): string {
    const max = this.entradas.reduce((acc, item) => {
      const n = Number(item.folio.replace('ENT-', ''));
      return Number.isNaN(n) ? acc : Math.max(acc, n);
    }, 0);

    return `ENT-${String(max + 1).padStart(4, '0')}`;
  }
}