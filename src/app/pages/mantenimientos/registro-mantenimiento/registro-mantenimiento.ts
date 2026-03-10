import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { CabeceraComponent } from '../../../components/cabecera/cabecera';
import { FooterComponent } from '../../../components/footer/footer';

type TipoServicio = 'Preventivo' | 'Correctivo';
type EstatusMantenimiento = 'Programado' | 'En proceso' | 'Terminado' | 'Cancelado';
type ServicioNivel = 'Servicio menor' | 'Servicio mayor';

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

@Component({
  selector: 'app-registro-mantenimiento',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CabeceraComponent, FooterComponent],
  templateUrl: './registro-mantenimiento.html',
})
export class RegistroMantenimientoComponent {

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
  // Formulario
  // =========================
  noOrden = '';
  fecha = '';
  horasTecnico: number | null = null;

  unidadId: number | null = null;

  tipoServicio: TipoServicio = 'Preventivo';
  kilometraje: number | null = null;

  estatus: EstatusMantenimiento = 'Terminado';
  nivelServicio: ServicioNivel = 'Servicio menor';

  tecnicos = '';

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
    unidad: false,
    kilometraje: false,
    tecnicos: false,
  };

  constructor(private router: Router) {}

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
    this.touched.unidad = true;
    this.touched.kilometraje = true;
    this.touched.tecnicos = true;

    const okFecha = !!this.fecha;
    const okUnidad = this.unidadId !== null;
    const okKm = this.kilometraje !== null && this.kilometraje >= 0;
    const okTec = this.tecnicos.trim().length > 0;

    const okOtro =
      !this.checklist.Otro ||
      this.otroTexto.trim().length > 0;

    return okFecha && okUnidad && okKm && okTec && okOtro;
  }

  // =========================
  // Navegación
  // =========================

  onCancelar(): void {
    this.router.navigate(['/mantenimientos']);
  }

  // =========================
  // Guardar (payload limpio)
  // =========================

  onGuardar(): void {

    if (!this.isValid()) return;

    const payload = {

      cabecera: {
        noOrden: this.noOrden || null,
        fecha: this.fecha,
        horasTecnico: this.horasTecnico,
        unidadId: this.unidadId,
        tipoServicio: this.tipoServicio,
        kilometraje: this.kilometraje,
        estatus: this.estatus,
        nivelServicio: this.nivelServicio,
        tecnicosTexto: this.tecnicos.trim(),
        checklist: this.checklist,
        otroTexto: this.checklist.Otro ? this.otroTexto.trim() : null,
        manoObra: this.manoObra ?? 0,
      },

      detalles: this.materiales
        .filter((m) => m.catalogoId !== null && m.cantidad > 0)
        .map((m) => ({
          articuloId: m.catalogoId,
          cantidad: m.cantidad,
          precioUnitarioAplicado: m.precioUnitario,
        }))
    };

    console.log('Payload mantenimiento:', payload);

    // cuando exista backend:
    // this.api.createMantenimiento(payload)

    this.router.navigate(['/mantenimientos']);
  }
}