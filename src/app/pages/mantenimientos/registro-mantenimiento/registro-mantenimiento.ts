import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { CabeceraComponent } from '../../../components/cabecera/cabecera';
import { FooterComponent } from '../../../components/footer/footer';

type TipoServicio = 'Preventivo' | 'Correctivo';
type EstatusMantenimiento = 'Programado' | 'En proceso' | 'Terminado' | 'Cancelado';
type ServicioNivel = 'Servicio menor' | 'Servicio mayor';
type ModoRegistroMantenimiento = 'directo' | 'solicitud';
type OrigenMantenimiento = 'DIRECTO' | 'SOLICITUD';

type ChecklistKey =
  | 'RevisionNiveles'
  | 'LimpiezaAjusteFrenos'
  | 'Engrasado'
  | 'RevisionLuces'
  | 'RevisionSuspension'
  | 'RevisionCarroceria'
  | 'RevisionSistemaElectrico'
  | 'Otro';

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

type SolicitudMock = {
  id: number;
  folio: string;
  unidadId: number;
  tipoServicio: TipoServicio;
  prioridad: 'Baja' | 'Media' | 'Alta' | 'Crítica';
  kilometraje: number | null;
  observaciones: string;
};

@Component({
  selector: 'app-registro-mantenimiento',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CabeceraComponent, FooterComponent],
  templateUrl: './registro-mantenimiento.html',
})
export class RegistroMantenimientoComponent implements OnInit {

  // =========================
  // Catálogos (mock por ahora)
  // =========================
  unidadesCatalogo: { id: number; nombre: string; placa?: string }[] = [
    { id: 1, nombre: 'Unidad 01', placa: 'GTO-123-A' },
    { id: 2, nombre: 'Unidad 02', placa: 'GTO-456-B' },
    { id: 3, nombre: 'Unidad 03', placa: 'GTO-789-C' },
  ];

  materialesCatalogo: MaterialCatalogo[] = [
    { id: 101, nombre: 'Aceite 15W-40', precio: 180, unidad: 'L' },
    { id: 102, nombre: 'Filtro de aceite', precio: 220, unidad: 'pz' },
    { id: 103, nombre: 'Grasa', precio: 95, unidad: 'kg' },
    { id: 104, nombre: 'Líquido de frenos', precio: 160, unidad: 'L' },
  ];

  // =========================
  // Mock de solicitudes
  // =========================
  solicitudesMock: SolicitudMock[] = [
    {
      id: 1,
      folio: 'SM-0001',
      unidadId: 1,
      tipoServicio: 'Correctivo',
      prioridad: 'Alta',
      kilometraje: 120345,
      observaciones: 'Se detecta ruido en frenos delanteros y vibración al frenar.',
    },
    {
      id: 2,
      folio: 'SM-0002',
      unidadId: 2,
      tipoServicio: 'Preventivo',
      prioridad: 'Media',
      kilometraje: 98500,
      observaciones: 'Solicitud de servicio preventivo general por kilometraje.',
    },
    {
      id: 3,
      folio: 'SM-0003',
      unidadId: 3,
      tipoServicio: 'Correctivo',
      prioridad: 'Crítica',
      kilometraje: 143220,
      observaciones: 'La unidad presenta fuga de aceite visible en patio.',
    },
  ];

  // =========================
  // Control interno de flujo
  // =========================
  modo: ModoRegistroMantenimiento = 'directo';
  solicitudId: number | null = null;
  origenMantenimiento: OrigenMantenimiento = 'DIRECTO';
  folioSolicitud: string | null = null;

  // =========================
  // Formulario
  // =========================
  noOrden = '';
  fecha = '';
  fechaSiguienteMantenimiento = '';
  horasTecnico: number | null = null;

  unidadId: number | null = null;

  tipoServicio: TipoServicio = 'Preventivo';
  kilometraje: number | null = null;

  estatus: EstatusMantenimiento = 'Terminado';
  nivelServicio: ServicioNivel = 'Servicio menor';

  tecnicos = '';
  observaciones = '';

  checklist: Record<ChecklistKey, boolean> = {
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
    { catalogoId: null, nombre: '', cantidad: 1, precioUnitario: 0 },
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

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
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
  }

  private precargarDesdeSolicitud(id: number): void {
    const solicitud = this.solicitudesMock.find((s) => s.id === id);

    if (!solicitud) return;

    this.folioSolicitud = solicitud.folio;
    this.unidadId = solicitud.unidadId;
    this.tipoServicio = solicitud.tipoServicio;
    this.kilometraje = solicitud.kilometraje;
    this.observaciones = solicitud.observaciones;
  }

  // =========================
  // Helpers materiales
  // =========================

  onSelectMaterial(line: MaterialLinea): void {
    const item = this.materialesCatalogo.find((m) => m.id === line.catalogoId);

    if (!item) {
      line.nombre = '';
      line.unidad = undefined;
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

  // =========================
  // Validación
  // =========================

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

    const okOtro =
      !this.checklist.Otro ||
      this.otroTexto.trim().length > 0;

    return okFecha && okFechaSiguiente && okUnidad && okKm && okTec && okOtro;
  }

  // =========================
  // Navegación
  // =========================

  onCancelar(): void {
    this.router.navigate(['/mantenimientos']);
  }

  // =========================
  // Guardar
  // =========================

  onGuardar(): void {
    if (!this.isValid()) return;

    const payload = {
      cabecera: {
        noOrden: this.noOrden.trim() || null,
        fecha: this.fecha,
        fechaSiguienteMantenimiento: this.fechaSiguienteMantenimiento,
        horasTecnico: this.horasTecnico,
        unidadId: this.unidadId,
        tipoServicio: this.tipoServicio,
        kilometraje: this.kilometraje,
        estatus: this.estatus,
        nivelServicio: this.nivelServicio,
        tecnicosTexto: this.tecnicos.trim(),
        observaciones: this.observaciones.trim() || null,
        origenMantenimiento: this.origenMantenimiento,
        solicitudId: this.solicitudId,
        checklist: this.checklist,
        otroTexto: this.checklist.Otro ? this.otroTexto.trim() : null,
        manoObra: this.manoObra ?? 0,
        totalMateriales: this.totalMateriales(),
        totalFinalServicio: this.totalFinal(),
      },

      detalles: this.materiales
        .filter((m) => m.catalogoId !== null && m.cantidad > 0)
        .map((m) => ({
          articuloId: m.catalogoId,
          cantidad: m.cantidad,
          precioUnitarioAplicado: m.precioUnitario,
          subtotal: this.materialSubtotal(m),
        }))
    };

    console.log('Payload mantenimiento:', payload);

    this.router.navigate(['/mantenimientos']);
  }
}