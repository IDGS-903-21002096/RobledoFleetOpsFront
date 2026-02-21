import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { CabeceraComponent } from '../../../components/cabecera/cabecera';
import { FooterComponent } from '../../../components/footer/footer';

type InicioEstadisticas = 'Fecha de registro' | 'Fecha de compra';
type MedidaUso = 'Kilómetros' | 'Millas' | 'Horas';
type MedidaCombustible = 'Litros' | 'Galones';

@Component({
  selector: 'app-registro-vehiculo',
  standalone: true,
  imports: [CommonModule, FormsModule, CabeceraComponent, FooterComponent],
  templateUrl: './registro-vehiculo.html',
  styleUrl: './registro-vehiculo.scss',
})
export class RegistroVehiculo {
  constructor(private router: Router) {}

  // =========================
  // Catálogos (selects)
  // =========================
  tiposVehiculo: string[] = ['Autobús', 'Automóvil', 'Camión', 'Camioneta', 'Motocicleta', 'Otro'];
  statusVehiculo: string[] = ['Asignado', 'Disponible', 'En taller', 'Fuera de Servicio'];
  gruposVehiculo: string[] = ['Autobuses', 'Tractos', 'Urvan', 'Camionetas', 'Autos', 'Otro'];

  // =========================
  // Modelo (ngModel)
  // =========================
  model: {
    id: string;
    nombreVehiculo: string;
    marca: string;
    modelo: string;
    anio: number | null;
    tipoVehiculo: string;
    statusInicial: string;
    inicioEstadisticas: InicioEstadisticas | '';
    medidaUso: MedidaUso | '';
    medidaCombustible: MedidaCombustible | '';

    // Adicional
    grupo: string;
    numeroSerie: string;
    placa: string;
    color: string;
    companiaSeguros: string;
    polizaSeguro: string;
    vigenciaPoliza: string; // YYYY-MM-DD
  } = {
    id: '',
    nombreVehiculo: '',
    marca: '',
    modelo: '',
    anio: null,
    tipoVehiculo: '',
    statusInicial: '',
    inicioEstadisticas: '',
    medidaUso: '',
    medidaCombustible: '',

    grupo: '',
    numeroSerie: '',
    placa: '',
    color: '',
    companiaSeguros: '',
    polizaSeguro: '',
    vigenciaPoliza: '',
  };

  // =========================
  // Flags "touched"
  // =========================
  // Requeridos
  nombreVehiculoTouched = false;
  marcaTouched = false;
  modeloTouched = false;
  anioTouched = false;
  tipoTouched = false;
  statusTouched = false;
  inicioEstadisticasTouched = false;
  medidaUsoTouched = false;
  medidaCombTouched = false;

  // Opcionales
  grupoTouched = false;
  serieTouched = false;
  placaTouched = false;
  colorTouched = false;
  companiaTouched = false;
  polizaTouched = false;
  vigenciaTouched = false;

  // =========================
  // Helpers
  // =========================
  private isNonEmptyText(v: unknown): boolean {
    return typeof v === 'string' && v.trim().length > 0;
  }

  /** Opcional text: tiene algo escrito */
  hasText(v: unknown): boolean {
    return this.isNonEmptyText(v);
  }

  /** Select/date: tiene selección */
  hasSelection(v: unknown): boolean {
    return typeof v === 'string' && v !== '';
  }

  // =========================
  // Validaciones (Requeridos)
  // =========================
  isValidNombreVehiculo(v: string): boolean {
    return this.isNonEmptyText(v) && v.trim().length >= 2;
  }

  isValidMarca(v: string): boolean {
    return this.isNonEmptyText(v);
  }

  isValidModelo(v: string): boolean {
    return this.isNonEmptyText(v);
  }

  isValidAnio(v: number | null): boolean {
    if (v === null || Number.isNaN(v)) return false;
    const year = Number(v);
    const currentYear = new Date().getFullYear();
    return year >= 1900 && year <= currentYear + 1;
  }

  isValidTipo(v: string): boolean {
    return this.isNonEmptyText(v);
  }

  isValidStatus(v: string): boolean {
    return this.isNonEmptyText(v);
  }

  isValidInicioEstadisticas(v: string): boolean {
    return v === 'Fecha de registro' || v === 'Fecha de compra';
  }

  isValidMedidaUso(v: string): boolean {
    return v === 'Kilómetros' || v === 'Millas' || v === 'Horas';
  }

  isValidMedidaComb(v: string): boolean {
    return v === 'Litros' || v === 'Galones';
  }

  // =========================
  // Validaciones (Opcionales)
  // (validan formato SOLO si traen valor)
  // =========================
  isValidGrupo(v: string): boolean {
    return !this.isNonEmptyText(v) || v.trim().length >= 2;
  }

  isValidSerie(v: string): boolean {
    if (!this.isNonEmptyText(v)) return true;
    const s = v.trim();
    return s.length >= 6 && s.length <= 30;
  }

  isValidPlaca(v: string): boolean {
    if (!this.isNonEmptyText(v)) return true;
    const s = v.trim();
    return s.length >= 5 && s.length <= 15;
  }

  isValidColor(v: string): boolean {
    if (!this.isNonEmptyText(v)) return true;
    return v.trim().length >= 3;
  }

  isValidCompania(v: string): boolean {
    if (!this.isNonEmptyText(v)) return true;
    return v.trim().length >= 2;
  }

  isValidPoliza(v: string): boolean {
    if (!this.isNonEmptyText(v)) return true;
    return v.trim().length >= 4;
  }

  isValidVigencia(v: string): boolean {
    if (!this.isNonEmptyText(v)) return true;
    const d = new Date(v);
    return !Number.isNaN(d.getTime());
  }

  // =========================
  // Acciones
  // =========================
  onCancelar(): void {
    // Ir al listado de vehículos
    this.router.navigate(['/vehiculos']);
  }

  onGuardar(): void {
    // Marca touched de campos obligatorios para mostrar feedback
    this.nombreVehiculoTouched = true;
    this.marcaTouched = true;
    this.modeloTouched = true;
    this.anioTouched = true;
    this.tipoTouched = true;
    this.statusTouched = true;
    this.inicioEstadisticasTouched = true;
    this.medidaUsoTouched = true;
    this.medidaCombTouched = true;

    // Validación mínima requerida
    const ok =
      this.isValidNombreVehiculo(this.model.nombreVehiculo) &&
      this.isValidMarca(this.model.marca) &&
      this.isValidModelo(this.model.modelo) &&
      this.isValidAnio(this.model.anio) &&
      this.isValidTipo(this.model.tipoVehiculo) &&
      this.isValidStatus(this.model.statusInicial) &&
      this.isValidInicioEstadisticas(this.model.inicioEstadisticas) &&
      this.isValidMedidaUso(this.model.medidaUso) &&
      this.isValidMedidaComb(this.model.medidaCombustible);

    if (!ok) return;

    // Aquí después iría el submit al API.
  }
}
