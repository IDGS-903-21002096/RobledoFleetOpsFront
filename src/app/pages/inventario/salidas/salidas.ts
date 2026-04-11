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
  CrearSalidaInventarioRequest,
  MotivoSalida,
  SalidaInventario,
  SalidasInventarioService,
  SalidasResumen
} from '../../../../services/salidas-inventario.service';

@Component({
  selector: 'app-salidas',
  standalone: true,
  imports: [CommonModule, FormsModule, CabeceraComponent, FooterComponent],
  templateUrl: './salidas.html',
  styleUrl: './salidas.scss',
})
export class SalidasComponent implements OnInit {
  private articulosService = inject(ArticulosInventarioService);
  private salidasService = inject(SalidasInventarioService);

  articulos: ArticuloInventario[] = [];

  motivosSalida: MotivoSalida[] = [
    'DAÑO',
    'MERMA',
    'BAJA',
    'PÉRDIDA',
    'CONSUMO INTERNO',
    'AJUSTE NEGATIVO',
  ];

  salidas: SalidaInventario[] = [];
  salidasFiltradas: SalidaInventario[] = [];
  salidasPaginadas: SalidaInventario[] = [];

  resumen: SalidasResumen = {
    totalSalidas: 0,
    cantidadTotalSalida: 0,
    costoTotalSalidas: 0,
  };

  form = {
    fecha: this.hoyISO(),
    articuloInventarioId: null as number | null,
    cantidad: null as number | null,
    costoUnitario: null as number | null,
    motivo: 'DAÑO' as MotivoSalida,
    referencia: '',
    observaciones: '',
    responsable: '',
  };

  busqueda = '';
  filtroMotivo = '';

  page = 1;
  pageSize = 5;

  mostrarFormulario = false;

  mostrarModalDetalle = false;
  salidaSeleccionada: SalidaInventario | null = null;

  loadingArticulos = false;
  loadingSalidas = false;
  saving = false;
  errorMessage = '';

  ngOnInit(): void {
    this.cargarArticulos();
    this.cargarSalidas();
  }

  get articuloSeleccionado(): ArticuloInventario | undefined {
    return this.articulos.find(a => a.id === this.form.articuloInventarioId!);
  }

  get totalFormulario(): number {
    const cantidad = Number(this.form.cantidad || 0);
    const costo = Number(this.form.costoUnitario || 0);
    return cantidad * costo;
  }

  get totalSalidas(): number {
    return this.resumen.totalSalidas;
  }

  get cantidadTotalSalida(): number {
    return this.resumen.cantidadTotalSalida;
  }

  get costoTotalSalidas(): number {
    return this.resumen.costoTotalSalidas;
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

  toggleFormulario(): void {
    this.mostrarFormulario = !this.mostrarFormulario;
  }

  onArticuloChange(): void {
    const articulo = this.articuloSeleccionado;
    if (!articulo) return;

    if (this.form.costoUnitario === null || this.form.costoUnitario <= 0) {
      this.form.costoUnitario = Number(articulo.costoPromedio ?? 0);
    }
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

  cargarSalidas(): void {
    this.loadingSalidas = true;
    this.errorMessage = '';

    this.salidasService.getSalidas(this.busqueda, this.filtroMotivo).subscribe({
      next: (data) => {
        this.salidas = data ?? [];
        this.salidasFiltradas = [...this.salidas];
        this.page = 1;
        this.refrescarPaginado();
        this.loadingSalidas = false;
      },
      error: (error) => {
        console.error('Error al cargar salidas:', error);
        this.errorMessage = error?.error?.mensaje || 'No se pudieron cargar las salidas.';
        this.salidas = [];
        this.salidasFiltradas = [];
        this.salidasPaginadas = [];
        this.loadingSalidas = false;
      }
    });

    this.salidasService.getResumen(this.busqueda, this.filtroMotivo).subscribe({
      next: (data) => {
        this.resumen = data ?? {
          totalSalidas: 0,
          cantidadTotalSalida: 0,
          costoTotalSalidas: 0,
        };
      },
      error: (error) => {
        console.error('Error al cargar resumen de salidas:', error);
      }
    });
  }

  aplicarFiltros(): void {
    this.cargarSalidas();
  }

  guardarSalida(): void {
    if (!this.form.fecha) {
      alert('Debes seleccionar la fecha de la salida.');
      return;
    }

    if (!this.form.articuloInventarioId) {
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

    const payload: CrearSalidaInventarioRequest = {
      fecha: this.form.fecha,
      articuloInventarioId: this.form.articuloInventarioId,
      cantidad: this.form.cantidad,
      costoUnitario: this.form.costoUnitario,
      motivo: this.form.motivo,
      referencia: this.form.referencia?.trim() || null,
      observaciones: this.form.observaciones?.trim() || null,
      responsable: this.form.responsable?.trim() || null,
    };

    this.saving = true;

    this.salidasService.crearSalida(payload).subscribe({
      next: (response) => {
        alert(response?.mensaje || 'Salida registrada correctamente.');
        this.resetForm();
        this.saving = false;
        this.cargarSalidas();
        this.cargarArticulos();
        this.mostrarFormulario = false;
      },
      error: (error) => {
        console.error('Error al guardar salida:', error);
        alert(error?.error?.mensaje || 'No se pudo registrar la salida.');
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
      motivo: 'DAÑO',
      referencia: '',
      observaciones: '',
      responsable: '',
    };
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

  trackBySalidaId(_: number, item: SalidaInventario): number {
    return item.id;
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

    this.salidasService.eliminarSalida(item.id).subscribe({
      next: (response) => {
        if (this.salidaSeleccionada?.id === item.id) {
          this.cerrarModalDetalle();
        }

        alert(response?.mensaje || 'Salida eliminada correctamente.');
        this.cargarSalidas();
        this.cargarArticulos();
      },
      error: (error) => {
        console.error('Error al eliminar salida:', error);
        alert(error?.error?.mensaje || 'No se pudo eliminar la salida.');
      }
    });
  }
}