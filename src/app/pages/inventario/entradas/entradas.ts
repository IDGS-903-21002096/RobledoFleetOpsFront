import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CabeceraComponent } from '../../../components/cabecera/cabecera';
import { FooterComponent } from '../../../components/footer/footer';

import {
  ArticuloInventario,
  ArticulosInventarioService
} from '../../../../services/articulos-inventario.service';

import {
  CrearEntradaInventarioRequest,
  EntradaInventario,
  EntradasInventarioService,
  EntradasResumen,
  TipoEntrada
} from '../../../../services/entradas-inventario.service';

import {
  Proveedor,
  ProveedoresService
} from '../../../../services/proveedores.service';

@Component({
  selector: 'app-entradas',
  standalone: true,
  imports: [CommonModule, FormsModule, CabeceraComponent, FooterComponent],
  templateUrl: './entradas.html',
  styleUrl: './entradas.scss',
})
export class EntradasComponent implements OnInit {
  private articulosService = inject(ArticulosInventarioService);
  private entradasService = inject(EntradasInventarioService);
  private proveedoresService = inject(ProveedoresService);

  articulos: ArticuloInventario[] = [];
  proveedores: Proveedor[] = [];

  tiposEntrada: TipoEntrada[] = [
    'COMPRA',
    'DEVOLUCIÓN',
    'INVENTARIO INICIAL',
    'AJUSTE POSITIVO',
  ];

  entradas: EntradaInventario[] = [];
  entradasFiltradas: EntradaInventario[] = [];
  entradasPaginadas: EntradaInventario[] = [];

  resumen: EntradasResumen = {
    totalEntradas: 0,
    cantidadTotalIngresada: 0,
    costoTotalEntradas: 0,
  };

  form = {
    fecha: this.hoyISO(),
    articuloInventarioId: null as number | null,
    cantidad: null as number | null,
    costoUnitario: null as number | null,
    proveedorId: null as number | null,
    proveedorNombreManual: '',
    tipoEntrada: 'COMPRA' as TipoEntrada,
    referencia: '',
    observaciones: '',
  };

  touched = {
    fecha: false,
    articuloInventarioId: false,
    cantidad: false,
    costoUnitario: false,
    proveedor: false,
    tipoEntrada: false,
    referencia: false,
  };

  busqueda = '';
  filtroTipo = '';

  page = 1;
  pageSize = 5;

  mostrarFormulario = false;
  usarProveedorManual = false;

  mostrarModalDetalle = false;
  entradaSeleccionada: EntradaInventario | null = null;

  loadingArticulos = false;
  loadingProveedores = false;
  loadingEntradas = false;
  saving = false;
  errorMessage = '';

  ngOnInit(): void {
    this.cargarArticulos();
    this.cargarProveedores();
    this.cargarEntradas();
  }

  get articuloSeleccionado(): ArticuloInventario | undefined {
    return this.articulos.find(a => a.id === this.form.articuloInventarioId!);
  }

  get totalFormulario(): number {
    const cantidad = Number(this.form.cantidad || 0);
    const costo = Number(this.form.costoUnitario || 0);
    return cantidad * costo;
  }

  get totalEntradas(): number {
    return this.resumen.totalEntradas;
  }

  get cantidadTotalIngresada(): number {
    return this.resumen.cantidadTotalIngresada;
  }

  get costoTotalEntradas(): number {
    return this.resumen.costoTotalEntradas;
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

  toggleFormulario(): void {
    this.mostrarFormulario = !this.mostrarFormulario;
  }

  onArticuloChange(): void {
    // Reservado por si luego quieres autocompletar costo sugerido o mostrar existencia
  }

  onProveedorModeChange(): void {
    this.form.proveedorId = null;
    this.form.proveedorNombreManual = '';
    this.touched.proveedor = false;
  }

  cargarArticulos(): void {
    this.loadingArticulos = true;

    this.articulosService.getArticulosActivos().subscribe({
      next: (data) => {
        this.articulos = data ?? [];
        this.loadingArticulos = false;
      },
      error: (error) => {
        console.error('Error al cargar artículos:', error);
        this.errorMessage = error?.error?.mensaje || 'No se pudieron cargar los artículos.';
        this.loadingArticulos = false;
      }
    });
  }

  cargarProveedores(): void {
    this.loadingProveedores = true;

    this.proveedoresService.getProveedoresActivos().subscribe({
      next: (data) => {
        this.proveedores = data ?? [];
        this.loadingProveedores = false;
      },
      error: (error) => {
        console.error('Error al cargar proveedores:', error);
        this.errorMessage = error?.error?.mensaje || 'No se pudieron cargar los proveedores.';
        this.loadingProveedores = false;
      }
    });
  }

  cargarEntradas(): void {
    this.loadingEntradas = true;
    this.errorMessage = '';

    this.entradasService.getEntradas(this.busqueda, this.filtroTipo).subscribe({
      next: (data) => {
        this.entradas = data ?? [];
        this.entradasFiltradas = [...this.entradas];
        this.page = 1;
        this.refrescarPaginado();
        this.loadingEntradas = false;
      },
      error: (error) => {
        console.error('Error al cargar entradas:', error);
        this.errorMessage = error?.error?.mensaje || 'No se pudieron cargar las entradas.';
        this.entradas = [];
        this.entradasFiltradas = [];
        this.entradasPaginadas = [];
        this.loadingEntradas = false;
      }
    });

    this.entradasService.getResumen(this.busqueda, this.filtroTipo).subscribe({
      next: (data) => {
        this.resumen = data ?? {
          totalEntradas: 0,
          cantidadTotalIngresada: 0,
          costoTotalEntradas: 0,
        };
      },
      error: (error) => {
        console.error('Error al cargar resumen:', error);
      }
    });
  }

  aplicarFiltros(): void {
    this.cargarEntradas();
  }

  private formularioValido(): boolean {
    this.touched.fecha = true;
    this.touched.articuloInventarioId = true;
    this.touched.cantidad = true;
    this.touched.costoUnitario = true;
    this.touched.proveedor = true;
    this.touched.tipoEntrada = true;
    this.touched.referencia = true;

    if (!this.form.fecha) return false;
    if (!this.form.articuloInventarioId) return false;
    if (this.form.cantidad === null || this.form.cantidad <= 0) return false;
    if (this.form.costoUnitario === null || this.form.costoUnitario <= 0) return false;
    if (!this.form.tipoEntrada?.trim()) return false;
    if (!this.form.referencia?.trim()) return false;

    if (this.usarProveedorManual) {
      return !!this.form.proveedorNombreManual.trim();
    }

    return this.form.proveedorId !== null;
  }

  guardarEntrada(): void {
    this.errorMessage = '';

    if (!this.formularioValido()) {
      this.errorMessage = 'Revisa los campos obligatorios del formulario.';
      return;
    }

    const payload: CrearEntradaInventarioRequest = {
      fecha: this.form.fecha,
      articuloInventarioId: this.form.articuloInventarioId as number,
      cantidad: this.form.cantidad as number,
      costoUnitario: this.form.costoUnitario as number,
      proveedorId: this.usarProveedorManual ? null : this.form.proveedorId,
      proveedorNombreManual: this.usarProveedorManual
        ? this.form.proveedorNombreManual.trim()
        : null,
      tipoEntrada: this.form.tipoEntrada,
      referencia: this.form.referencia?.trim() || null,
      observaciones: this.form.observaciones?.trim() || null,
    };

    this.saving = true;

    this.entradasService.crearEntrada(payload).subscribe({
      next: (response) => {
        alert(response?.mensaje || 'Entrada registrada correctamente.');
        this.resetForm();
        this.saving = false;
        this.cargarEntradas();
        this.cargarArticulos();
        this.mostrarFormulario = false;
      },
      error: (error) => {
        console.error('Error al guardar entrada:', error);
        this.errorMessage = error?.error?.mensaje || 'No se pudo registrar la entrada.';
        this.saving = false;
      }
    });
  }

  resetForm(): void {
    this.form = {
      fecha: this.hoyISO(),
      articuloInventarioId: null,
      cantidad: null,
      costoUnitario: null,
      proveedorId: null,
      proveedorNombreManual: '',
      tipoEntrada: 'COMPRA',
      referencia: '',
      observaciones: '',
    };

    this.usarProveedorManual = false;

    this.touched = {
      fecha: false,
      articuloInventarioId: false,
      cantidad: false,
      costoUnitario: false,
      proveedor: false,
      tipoEntrada: false,
      referencia: false,
    };
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

  trackByEntradaId(_: number, item: EntradaInventario): number {
    return item.id;
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

    this.entradasService.eliminarEntrada(item.id).subscribe({
      next: (response) => {
        if (this.entradaSeleccionada?.id === item.id) {
          this.cerrarModalDetalle();
        }

        alert(response?.mensaje || 'Entrada eliminada correctamente.');
        this.cargarEntradas();
        this.cargarArticulos();
      },
      error: (error) => {
        console.error('Error al eliminar entrada:', error);
        alert(error?.error?.mensaje || 'No se pudo eliminar la entrada.');
      }
    });
  }
}