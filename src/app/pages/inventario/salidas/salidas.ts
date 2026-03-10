import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CabeceraComponent } from '../../../components/cabecera/cabecera';
import { FooterComponent } from '../../../components/footer/footer';

type Unidad = 'pz' | 'lt' | 'kg' | 'm' | 'jgo';
type MotivoSalida =
  | 'DAÑO'
  | 'MERMA'
  | 'BAJA'
  | 'PÉRDIDA'
  | 'CONSUMO INTERNO'
  | 'AJUSTE NEGATIVO';

interface ArticuloInventario {
  codigo: string;
  nombre: string;
  grupo: string;
  unidad: Unidad;
  existencia: number;
}

interface SalidaInventario {
  folio: string;
  fecha: string;
  codigoArticulo: string;
  articulo: string;
  grupo: string;
  unidad: Unidad;
  cantidad: number;
  costoUnitario: number;
  costoTotal: number;
  motivo: MotivoSalida;
  referencia: string;
  observaciones: string;
  usuario: string;
  responsable: string;
}

@Component({
  selector: 'app-salidas',
  standalone: true,
  imports: [CommonModule, FormsModule, CabeceraComponent, FooterComponent],
  templateUrl: './salidas.html',
  styleUrl: './salidas.scss',
})
export class SalidasComponent {
  articulos: ArticuloInventario[] = [
    { codigo: 'G141', nombre: 'Disco de lija 6" X 6 G100', grupo: 'HERRAMIENTA', unidad: 'pz', existencia: 15 },
    { codigo: 'H001', nombre: 'Pistola de Pintura', grupo: 'HERRAMIENTA', unidad: 'pz', existencia: 2 },
    { codigo: 'L020', nombre: 'Aceite 15W-40', grupo: 'LUBRICANTE', unidad: 'lt', existencia: 18 },
    { codigo: 'R310', nombre: 'Filtro de aire', grupo: 'REFACCIÓN', unidad: 'pz', existencia: 10 },
    { codigo: 'S777', nombre: 'Sellador silicón', grupo: 'CONSUMIBLE', unidad: 'pz', existencia: 12 },
  ];

  motivosSalida: MotivoSalida[] = [
    'DAÑO',
    'MERMA',
    'BAJA',
    'PÉRDIDA',
    'CONSUMO INTERNO',
    'AJUSTE NEGATIVO',
  ];

  salidas: SalidaInventario[] = [
    {
      folio: 'SAL-0001',
      fecha: '2026-03-03',
      codigoArticulo: 'R310',
      articulo: 'Filtro de aire',
      grupo: 'REFACCIÓN',
      unidad: 'pz',
      cantidad: 1,
      costoUnitario: 420,
      costoTotal: 420,
      motivo: 'DAÑO',
      referencia: 'INC-003',
      observaciones: 'Filtro dañado durante revisión de almacén.',
      usuario: 'Jorge Rangel',
      responsable: 'Almacén',
    },
    {
      folio: 'SAL-0002',
      fecha: '2026-03-05',
      codigoArticulo: 'L020',
      articulo: 'Aceite 15W-40',
      grupo: 'LUBRICANTE',
      unidad: 'lt',
      cantidad: 2,
      costoUnitario: 98.5,
      costoTotal: 197,
      motivo: 'CONSUMO INTERNO',
      referencia: 'INT-009',
      observaciones: 'Consumo interno para pruebas operativas.',
      usuario: 'Administrador',
      responsable: 'Mantenimiento',
    },
    {
      folio: 'SAL-0003',
      fecha: '2026-03-06',
      codigoArticulo: 'S777',
      articulo: 'Sellador silicón',
      grupo: 'CONSUMIBLE',
      unidad: 'pz',
      cantidad: 1,
      costoUnitario: 55,
      costoTotal: 55,
      motivo: 'MERMA',
      referencia: 'MER-001',
      observaciones: 'Empaque abierto y no utilizable.',
      usuario: 'Supervisor almacén',
      responsable: 'Almacén',
    },
  ];

  form = {
    fecha: this.hoyISO(),
    codigoArticulo: '',
    cantidad: null as number | null,
    costoUnitario: null as number | null,
    motivo: 'DAÑO' as MotivoSalida,
    referencia: '',
    observaciones: '',
    usuario: '',
    responsable: '',
  };

  busqueda = '';
  filtroMotivo = '';

  page = 1;
  pageSize = 10;

  mostrarFormulario = true;

  salidasFiltradas: SalidaInventario[] = [];
  salidasPaginadas: SalidaInventario[] = [];

  mostrarModalDetalle = false;
  salidaSeleccionada: SalidaInventario | null = null;

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

  get totalSalidas(): number {
    return this.salidasFiltradas.length;
  }

  get cantidadTotalSalida(): number {
    return this.salidasFiltradas.reduce((acc, item) => acc + item.cantidad, 0);
  }

  get costoTotalSalidas(): number {
    return this.salidasFiltradas.reduce((acc, item) => acc + item.costoTotal, 0);
  }

  get totalPages(): number {
    const total = this.salidasFiltradas.length;
    return Math.max(1, Math.ceil(total / this.pageSize));
  }

  get inicioRango(): number {
    const total = this.salidasFiltradas.length;
    if (total === 0) return 0;
    return (this.page - 1) * this.pageSize + 1;
  }

  get finRango(): number {
    const total = this.salidasFiltradas.length;
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
    const articulo = this.articuloSeleccionado;
    if (!articulo) return;

    if (!this.form.costoUnitario || this.form.costoUnitario <= 0) {
      const salidaRelacionada = this.salidas.find(s => s.codigoArticulo === articulo.codigo);
      this.form.costoUnitario = salidaRelacionada?.costoUnitario ?? 0;
    }
  }

  guardarSalida(): void {
    if (!this.form.fecha) {
      alert('Debes seleccionar la fecha de la salida.');
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

    if (Number(this.form.cantidad) > articulo.existencia) {
      alert(`La cantidad excede la existencia actual del artículo (${articulo.existencia} ${articulo.unidad}).`);
      return;
    }

    const nuevaSalida: SalidaInventario = {
      folio: this.generarFolio(),
      fecha: this.form.fecha,
      codigoArticulo: articulo.codigo,
      articulo: articulo.nombre,
      grupo: articulo.grupo,
      unidad: articulo.unidad,
      cantidad: Number(this.form.cantidad),
      costoUnitario: Number(this.form.costoUnitario),
      costoTotal: Number(this.form.cantidad) * Number(this.form.costoUnitario),
      motivo: this.form.motivo,
      referencia: this.form.referencia.trim(),
      observaciones: this.form.observaciones.trim(),
      usuario: this.form.usuario.trim(),
      responsable: this.form.responsable.trim(),
    };

    articulo.existencia -= Number(this.form.cantidad);

    this.salidas = [nuevaSalida, ...this.salidas];
    this.limpiarFormulario(false);
    this.aplicarFiltros();
    this.mostrarFormulario = false;

    alert(`Salida ${nuevaSalida.folio} registrada correctamente (mock).`);
  }

  limpiarFormulario(resetFecha: boolean = true): void {
    this.form = {
      fecha: resetFecha ? this.hoyISO() : this.form.fecha,
      codigoArticulo: '',
      cantidad: null,
      costoUnitario: null,
      motivo: 'DAÑO',
      referencia: '',
      observaciones: '',
      usuario: '',
      responsable: '',
    };
  }

  aplicarFiltros(): void {
    const q = (this.busqueda || '').trim().toLowerCase();
    const motivo = (this.filtroMotivo || '').trim().toLowerCase();

    this.salidasFiltradas = this.salidas.filter(item => {
      const matchMotivo = !motivo || this.toText(item.motivo) === motivo;

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
          item.motivo,
          item.referencia,
          item.observaciones,
          item.usuario,
          item.responsable,
        ]
          .map(v => this.toText(v))
          .some(txt => txt.includes(q));

      return matchMotivo && matchQuery;
    });

    this.page = Math.min(this.page, this.totalPages);
    this.page = Math.max(1, this.page);

    this.refrescarPaginado();
  }

  refrescarPaginado(): void {
    const start = (this.page - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.salidasPaginadas = this.salidasFiltradas.slice(start, end);
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

  trackByFolio(_: number, item: SalidaInventario): string {
    return item.folio;
  }

  onVerDetalle(item: SalidaInventario): void {
    this.salidaSeleccionada = item;
    this.mostrarModalDetalle = true;
  }

  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
    this.salidaSeleccionada = null;
  }

  onEliminar(item: SalidaInventario): void {
    const ok = confirm(`¿Eliminar la salida ${item.folio} del artículo ${item.articulo}?`);
    if (!ok) return;

    const articulo = this.articulos.find(a => a.codigo === item.codigoArticulo);
    if (articulo) {
      articulo.existencia += item.cantidad;
    }

    this.salidas = this.salidas.filter(x => x.folio !== item.folio);

    if (this.salidaSeleccionada?.folio === item.folio) {
      this.cerrarModalDetalle();
    }

    this.aplicarFiltros();
  }

  private generarFolio(): string {
    const max = this.salidas.reduce((acc, item) => {
      const n = Number(item.folio.replace('SAL-', ''));
      return Number.isNaN(n) ? acc : Math.max(acc, n);
    }, 0);

    return `SAL-${String(max + 1).padStart(4, '0')}`;
  }
}