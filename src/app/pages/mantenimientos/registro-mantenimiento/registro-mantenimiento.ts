import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { CabeceraComponent } from '../../../components/cabecera/cabecera';
import { FooterComponent } from '../../../components/footer/footer';

import { Vehiculo, VehiculosService } from '../../../../services/vehiculos.service';
import {
  ArticuloInventario,
  ArticulosInventarioService
} from '../../../../services/articulos-inventario.service';
import {
  SolicitudMantenimiento,
  SolicitudesMantenimientoService
} from '../../../../services/solicitudes-mantenimiento.service';
import {
  CrearMantenimientoRequest,
  DetalleMantenimientoRequest,
  MantenimientosService
} from '../../../../services/mantenimientos.service';

type TipoServicio = 'Preventivo' | 'Correctivo';
type EstatusMantenimiento = 'Programado' | 'En proceso' | 'Finalizado' | 'Cancelado';
type ServicioNivel = 'Servicio menor' | 'Servicio mayor';
type ModoRegistroMantenimiento = 'directo' | 'solicitud';
type OrigenMantenimiento = 'DIRECTO' | 'SOLICITUD';

type MaterialCatalogo = {
  id: number;
  nombre: string;
  precio: number;
  unidad?: string;
};

type MaterialLinea = {
  catalogoId: number | null;
  nombre: string;
  unidad?: string;
  cantidad: number;
  precioUnitario: number;
};

@Component({
  selector: 'app-registro-mantenimiento',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CabeceraComponent, FooterComponent],
  templateUrl: './registro-mantenimiento.html',
})
export class RegistroMantenimientoComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private vehiculosService = inject(VehiculosService);
  private articulosService = inject(ArticulosInventarioService);
  private solicitudesService = inject(SolicitudesMantenimientoService);
  private mantenimientosService = inject(MantenimientosService);

  editId: number | null = null;

  unidadesCatalogo: Vehiculo[] = [];
  materialesCatalogo: MaterialCatalogo[] = [];

  modo: ModoRegistroMantenimiento = 'directo';
  solicitudId: number | null = null;
  origenMantenimiento: OrigenMantenimiento = 'DIRECTO';
  folioSolicitud: string | null = null;

  noOrden = '';
  fecha = '';
  fechaSiguienteMantenimiento = '';
  horasTecnico: number | null = null;

  unidadId: number | null = null;
  tipoServicio: TipoServicio = 'Preventivo';
  kilometraje: number | null = null;

  estatus: EstatusMantenimiento = 'Programado';
  nivelServicio: ServicioNivel = 'Servicio menor';

  tecnicos = '';
  observaciones = '';

  checklist = {
    RevisionNiveles: false,
    LimpiezaAjusteFrenos: false,
    Engrasado: false,
    RevisionLuces: false,
    RevisionSuspension: false,
    RevisionCarroceria: false,
    RevisionSistemaElectrico: false,
    Otro: false,
  };

  otroTexto = '';

  materiales: MaterialLinea[] = [
    { catalogoId: null, nombre: '', cantidad: 1, precioUnitario: 0, unidad: '' },
  ];

  manoObra: number | null = null;

  touched = {
    fecha: false,
    fechaSiguiente: false,
    unidad: false,
    kilometraje: false,
    tecnicos: false,
    otroTexto: false,
  };

  loading = false;
  saving = false;
  closing = false;
  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    this.cargarCatalogos();

    const idParam = this.route.snapshot.paramMap.get('id');
    this.editId = idParam ? Number(idParam) : null;

    this.route.queryParamMap.subscribe((params) => {
      const modoParam = params.get('modo');
      const solicitudIdParam = params.get('solicitudId');

      if (modoParam === 'solicitud' && solicitudIdParam) {
        const id = Number(solicitudIdParam);

        if (!isNaN(id)) {
          this.modo = 'solicitud';
          this.solicitudId = id;
          this.origenMantenimiento = 'SOLICITUD';
          this.precargarDesdeSolicitud(id);
          return;
        }
      }

      this.modo = 'directo';
      this.solicitudId = null;
      this.origenMantenimiento = 'DIRECTO';
      this.folioSolicitud = null;
    });

    if (this.editId !== null && !isNaN(this.editId)) {
      this.cargarMantenimiento(this.editId);
    }
  }

  get isFinalizado(): boolean {
    return this.estatus === 'Finalizado';
  }

  get canCerrarDesdeFormulario(): boolean {
    return !!this.editId
      && this.estatus === 'En proceso'
      && !!this.fecha
      && this.fecha <= this.getHoyLocal();
  }

  private cargarCatalogos(): void {
    this.loading = true;
    this.errorMessage = '';

    this.vehiculosService.getVehiculosActivos().subscribe({
      next: (data) => {
        this.unidadesCatalogo = data ?? [];
      },
      error: (error) => {
        console.error('Error al cargar unidades:', error);
        this.errorMessage = 'No se pudieron cargar las unidades.';
      }
    });

    this.articulosService.getArticulosActivos().subscribe({
      next: (data) => {
        this.materialesCatalogo = (data ?? []).map((a: ArticuloInventario) => ({
          id: a.id,
          nombre: a.nombre,
          precio: Number(a.costoPromedio ?? 0),
          unidad: a.unidad
        }));
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar materiales:', error);
        this.errorMessage = 'No se pudieron cargar los materiales del inventario.';
        this.loading = false;
      }
    });
  }

  private precargarDesdeSolicitud(id: number): void {
    this.solicitudesService.getSolicitudById(id).subscribe({
      next: (solicitud: SolicitudMantenimiento) => {
        this.folioSolicitud = solicitud.folio;
        this.unidadId = solicitud.vehiculoId;
        this.tipoServicio = solicitud.tipoServicio;
        this.kilometraje = solicitud.kilometraje ?? null;
        this.observaciones = solicitud.observaciones ?? '';
      },
      error: (error) => {
        console.error('Error al cargar solicitud:', error);
        this.errorMessage = 'No se pudo cargar la solicitud de mantenimiento.';
      }
    });
  }

  private cargarMantenimiento(id: number): void {
    this.loading = true;

    this.mantenimientosService.getMantenimientoById(id).subscribe({
      next: (m) => {
        this.noOrden = m.noOrden ?? '';
        this.fecha = this.toDateInput(m.fecha);
        this.fechaSiguienteMantenimiento = this.toDateInput(m.fechaSiguienteMantenimiento);
        this.horasTecnico = m.horasTecnico ?? null;
        this.unidadId = m.vehiculoId;
        this.tipoServicio = m.tipoServicio as TipoServicio;
        this.kilometraje = m.kilometraje;
        this.estatus = (m.estatus === 'Terminado' ? 'Finalizado' : m.estatus) as EstatusMantenimiento;
        this.nivelServicio = m.nivelServicio as ServicioNivel;
        this.tecnicos = m.tecnicosTexto ?? '';
        this.observaciones = m.observaciones ?? '';
        this.origenMantenimiento = (m.origenMantenimiento ?? 'DIRECTO') as OrigenMantenimiento;
        this.solicitudId = m.solicitudMantenimientoId ?? null;

        this.checklist = {
          RevisionNiveles: m.revisionNiveles,
          LimpiezaAjusteFrenos: m.limpiezaAjusteFrenos,
          Engrasado: m.engrasado,
          RevisionLuces: m.revisionLuces,
          RevisionSuspension: m.revisionSuspension,
          RevisionCarroceria: m.revisionCarroceria,
          RevisionSistemaElectrico: m.revisionSistemaElectrico,
          Otro: m.checklistOtro,
        };

        this.otroTexto = m.checklistOtroTexto ?? '';
        this.manoObra = Number(m.manoObra ?? 0);

        this.materiales = (m.detalles ?? []).map((d) => ({
          catalogoId: d.articuloInventarioId,
          nombre: d.articuloNombre,
          unidad: d.unidad,
          cantidad: Number(d.cantidad ?? 0),
          precioUnitario: Number(d.precioUnitarioAplicado ?? 0),
        }));

        if (this.materiales.length === 0) {
          this.materiales = [{ catalogoId: null, nombre: '', cantidad: 1, precioUnitario: 0, unidad: '' }];
        }

        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar mantenimiento:', error);
        this.errorMessage = 'No se pudo cargar el mantenimiento.';
        this.loading = false;
      }
    });
  }

  private toDateInput(value: string): string {
    if (!value) return '';
    return value.substring(0, 10);
  }

  private getHoyLocal(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = `${now.getMonth() + 1}`.padStart(2, '0');
    const day = `${now.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private estatusRequiereFechaVigente(): boolean {
    return this.estatus === 'En proceso' || this.estatus === 'Finalizado';
  }

  private validarFechaContraEstatus(): boolean {
    if (!this.estatusRequiereFechaVigente()) {
      return true;
    }

    if (!this.fecha) {
      return false;
    }

    return this.fecha <= this.getHoyLocal();
  }

  onSelectMaterial(line: MaterialLinea): void {
    const item = this.materialesCatalogo.find((m) => m.id === line.catalogoId);

    if (!item) {
      line.nombre = '';
      line.unidad = '';
      line.precioUnitario = 0;
      return;
    }

    line.nombre = item.nombre;
    line.unidad = item.unidad;
    line.precioUnitario = item.precio ?? 0;

    if (!line.cantidad || line.cantidad < 1) {
      line.cantidad = 1;
    }
  }

  addMaterialLine(): void {
    this.materiales.push({
      catalogoId: null,
      nombre: '',
      cantidad: 1,
      precioUnitario: 0,
      unidad: '',
    });
  }

  removeMaterialLine(i: number): void {
    this.materiales.splice(i, 1);

    if (this.materiales.length === 0) {
      this.materiales.push({
        catalogoId: null,
        nombre: '',
        cantidad: 1,
        precioUnitario: 0,
        unidad: '',
      });
    }
  }

  materialSubtotal(line: MaterialLinea): number {
    const qty = Number(line.cantidad ?? 0);
    const price = Number(line.precioUnitario ?? 0);

    if (!isFinite(qty) || !isFinite(price)) return 0;
    return Math.max(0, qty) * Math.max(0, price);
  }

  totalMateriales(): number {
    return this.materiales.reduce((acc, l) => acc + this.materialSubtotal(l), 0);
  }

  totalFinal(): number {
    const mo = Number(this.manoObra ?? 0);
    return this.totalMateriales() + (isFinite(mo) ? Math.max(0, mo) : 0);
  }

  private isValid(): boolean {
    this.touched.fecha = true;
    this.touched.fechaSiguiente = true;
    this.touched.unidad = true;
    this.touched.kilometraje = true;
    this.touched.tecnicos = true;

    if (this.checklist.Otro) {
      this.touched.otroTexto = true;
    }

    const okFecha = !!this.fecha;
    const okFechaSiguiente = !!this.fechaSiguienteMantenimiento;
    const okUnidad = this.unidadId !== null;
    const okKm = this.kilometraje !== null && this.kilometraje >= 0;
    const okTec = this.tecnicos.trim().length > 0;
    const okOtro = !this.checklist.Otro || this.otroTexto.trim().length > 0;
    const okFechaEstatus = this.validarFechaContraEstatus();

    if (!okFechaEstatus) {
      this.errorMessage =
        'No se puede iniciar o finalizar un mantenimiento antes de la fecha programada. Actualiza la fecha primero.';
    }

    return okFecha && okFechaSiguiente && okUnidad && okKm && okTec && okOtro && okFechaEstatus;
  }

  onCancelar(): void {
    this.router.navigate(['/mantenimientos']);
  }

  onCerrarMantenimiento(): void {
    if (!this.editId) return;

    this.errorMessage = '';
    this.successMessage = '';

    if (!this.fecha || this.fecha > this.getHoyLocal()) {
      this.errorMessage =
        'No se puede finalizar un mantenimiento antes de la fecha programada. Actualiza la fecha primero.';
      return;
    }

    const confirmar = confirm(`¿Deseas cerrar el mantenimiento ${this.noOrden || '#' + this.editId}?`);
    if (!confirmar) return;

    this.closing = true;

    this.mantenimientosService.cerrarMantenimiento(this.editId).subscribe({
      next: (response) => {
        this.closing = false;
        this.successMessage = response?.message || 'Mantenimiento cerrado correctamente.';
        this.router.navigate(['/mantenimientos']);
      },
      error: (error) => {
        console.error('Error al cerrar mantenimiento:', error);
        this.errorMessage =
          error?.error?.message ||
          error?.error?.detail ||
          error?.error ||
          'No se pudo cerrar el mantenimiento.';
        this.closing = false;
      }
    });
  }

  onGuardar(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.isValid()) {
      if (!this.errorMessage) {
        this.errorMessage = 'Revisa los campos obligatorios.';
      }
      return;
    }

    const estatusParaGuardar: EstatusMantenimiento =
      this.editId && this.estatus === 'Finalizado' ? 'En proceso' : this.estatus;

    if (this.editId && this.estatus === 'Finalizado') {
      this.errorMessage =
        'Para finalizar un mantenimiento usa el botón "Cerrar mantenimiento".';
      return;
    }

    const detalles: DetalleMantenimientoRequest[] = this.materiales
      .filter((m) => m.catalogoId !== null && m.cantidad > 0)
      .map((m) => ({
        articuloInventarioId: m.catalogoId as number,
        cantidad: Number(m.cantidad ?? 0),
        precioUnitarioAplicado: Number(m.precioUnitario ?? 0),
      }));

    const payload: CrearMantenimientoRequest = {
      fecha: this.fecha,
      fechaSiguienteMantenimiento: this.fechaSiguienteMantenimiento,
      horasTecnico: this.horasTecnico,
      vehiculoId: this.unidadId as number,
      tipoServicio: this.tipoServicio,
      kilometraje: this.kilometraje as number,
      estatus: estatusParaGuardar,
      nivelServicio: this.nivelServicio,
      tecnicosTexto: this.tecnicos.trim(),
      observaciones: this.observaciones.trim() || null,
      origenMantenimiento: this.origenMantenimiento,
      solicitudMantenimientoId: this.solicitudId,

      revisionNiveles: this.checklist.RevisionNiveles,
      limpiezaAjusteFrenos: this.checklist.LimpiezaAjusteFrenos,
      engrasado: this.checklist.Engrasado,
      revisionLuces: this.checklist.RevisionLuces,
      revisionSuspension: this.checklist.RevisionSuspension,
      revisionCarroceria: this.checklist.RevisionCarroceria,
      revisionSistemaElectrico: this.checklist.RevisionSistemaElectrico,
      checklistOtro: this.checklist.Otro,
      checklistOtroTexto: this.checklist.Otro ? this.otroTexto.trim() : null,

      manoObra: Number(this.manoObra ?? 0),
      detalles
    };

    this.saving = true;

    const request$ = this.editId
      ? this.mantenimientosService.actualizarMantenimiento(this.editId, payload)
      : this.mantenimientosService.crearMantenimiento(payload);

    request$.subscribe({
      next: (response) => {
        this.saving = false;
        this.successMessage = response?.message || (this.editId
          ? 'Mantenimiento actualizado correctamente.'
          : 'Mantenimiento creado correctamente.');

        this.router.navigate(['/mantenimientos']);
      },
      error: (error) => {
        console.error('Error al guardar mantenimiento:', error);
        this.errorMessage = error?.error?.message || error?.error || 'No se pudo guardar el mantenimiento.';
        this.saving = false;
      }
    });
  }
}