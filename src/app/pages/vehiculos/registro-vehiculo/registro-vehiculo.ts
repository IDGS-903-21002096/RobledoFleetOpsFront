import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { CabeceraComponent } from '../../../components/cabecera/cabecera';
import { FooterComponent } from '../../../components/footer/footer';
import {
  CrearVehiculoRequest,
  EditarVehiculoRequest,
  Vehiculo,
  VehiculosService
} from '../../../../services/vehiculos.service';
import { TipoVehiculo, TiposVehiculoService } from '../../../../services/tipos-vehiculo.service';

type InicioEstadisticas = 'Fecha de registro' | 'Fecha de compra';
type MedidaUso = 'Kilómetros' | 'Millas' | 'Horas';
type MedidaCombustible = 'Litros' | 'Galones';
type DivisionVehiculo =
  | 'Container'
  | 'Carga León'
  | 'Personal'
  | 'Utilitarios'
  | 'Remolques'
  | 'Turismo';

@Component({
  selector: 'app-registro-vehiculo',
  standalone: true,
  imports: [CommonModule, FormsModule, CabeceraComponent, FooterComponent],
  templateUrl: './registro-vehiculo.html',
  styleUrl: './registro-vehiculo.scss',
})
export class RegistroVehiculoComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private vehiculosService = inject(VehiculosService);
  private tiposVehiculoService = inject(TiposVehiculoService);

  isEditMode = false;
  loading = false;
  saving = false;
  errorMessage = '';

  tiposVehiculo: TipoVehiculo[] = [];
  statusVehiculo: string[] = ['Asignado', 'Disponible', 'En taller', 'Fuera de Servicio'];
  gruposVehiculo: string[] = ['Autobuses', 'Tractos', 'Sprinter', 'Urvan', 'Camionetas', 'Autos', 'Otro'];
  divisionesVehiculo: DivisionVehiculo[] = [
    'Container',
    'Carga León',
    'Personal',
    'Utilitarios',
    'Remolques',
    'Turismo',
  ];

  model: {
    id: number | null;
    nombreVehiculo: string;
    marca: string;
    modelo: string;
    anio: number | null;
    tipoVehiculoId: number | null;
    statusInicial: string;
    inicioEstadisticas: InicioEstadisticas | '';
    medidaUso: MedidaUso | '';
    medidaCombustible: MedidaCombustible | '';
    grupo: string;
    division: DivisionVehiculo | '';
    numeroSerie: string;
    placa: string;
    color: string;
    companiaSeguros: string;
    polizaSeguro: string;
    activo: boolean;
  } = {
    id: null,
    nombreVehiculo: '',
    marca: '',
    modelo: '',
    anio: null,
    tipoVehiculoId: null,
    statusInicial: '',
    inicioEstadisticas: '',
    medidaUso: '',
    medidaCombustible: '',
    grupo: '',
    division: '',
    numeroSerie: '',
    placa: '',
    color: '',
    companiaSeguros: '',
    polizaSeguro: '',
    activo: true,
  };

  nombreVehiculoTouched = false;
  marcaTouched = false;
  modeloTouched = false;
  anioTouched = false;
  tipoTouched = false;
  statusTouched = false;
  inicioEstadisticasTouched = false;
  medidaUsoTouched = false;
  medidaCombTouched = false;

  grupoTouched = false;
  divisionTouched = false;
  serieTouched = false;
  placaTouched = false;
  colorTouched = false;
  companiaTouched = false;
  polizaTouched = false;

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!idParam;
    this.cargarPantalla(idParam ? Number(idParam) : null);
  }

  private cargarPantalla(vehiculoId: number | null): void {
    this.loading = true;
    this.errorMessage = '';

    this.tiposVehiculoService.getTipos().subscribe({
      next: (tipos) => {
        this.tiposVehiculo = (tipos ?? []).filter(t => t.activo);

        if (vehiculoId) {
          this.cargarVehiculo(vehiculoId);
        } else {
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Error al cargar tipos de vehículo:', error);
        this.errorMessage = 'No se pudieron cargar los tipos de vehículo.';
        this.loading = false;
      }
    });
  }

  private cargarVehiculo(id: number): void {
    this.vehiculosService.getVehiculoById(id).subscribe({
      next: (vehiculo: Vehiculo) => {
        this.model = {
          id: vehiculo.id,
          nombreVehiculo: vehiculo.nombreVehiculo ?? '',
          marca: vehiculo.marca ?? '',
          modelo: vehiculo.modelo ?? '',
          anio: vehiculo.anio ?? null,
          tipoVehiculoId: vehiculo.tipoVehiculoId ?? null,
          statusInicial: vehiculo.statusInicial ?? '',
          inicioEstadisticas: (vehiculo.inicioEstadisticas as InicioEstadisticas) ?? '',
          medidaUso: (vehiculo.medidaUso as MedidaUso) ?? '',
          medidaCombustible: (vehiculo.medidaCombustible as MedidaCombustible) ?? '',
          grupo: vehiculo.grupo ?? '',
          division: (vehiculo.division as DivisionVehiculo) ?? '',
          numeroSerie: vehiculo.numeroSerie ?? '',
          placa: vehiculo.placa ?? '',
          color: vehiculo.color ?? '',
          companiaSeguros: vehiculo.companiaSeguros ?? '',
          polizaSeguro: vehiculo.polizaSeguro ?? '',
          activo: vehiculo.activo,
        };

        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar vehículo:', error);
        this.errorMessage = error?.error?.mensaje || 'No se pudo cargar el vehículo.';
        this.loading = false;
      }
    });
  }

  private isNonEmptyText(v: unknown): boolean {
    return typeof v === 'string' && v.trim().length > 0;
  }

  private normalizeOptional(value: string): string | null {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  hasText(v: unknown): boolean {
    return this.isNonEmptyText(v);
  }

  hasSelection(v: unknown): boolean {
    if (typeof v === 'number') return v > 0;
    return typeof v === 'string' && v.trim() !== '';
  }

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

  isValidTipo(v: number | null): boolean {
    return typeof v === 'number' && v > 0;
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

  isValidGrupo(v: string): boolean {
    return !this.isNonEmptyText(v) || v.trim().length >= 2;
  }

  isValidDivision(v: string): boolean {
    return !this.isNonEmptyText(v) || this.divisionesVehiculo.includes(v as DivisionVehiculo);
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

  get selectedTipoNombre(): string {
    const tipo = this.tiposVehiculo.find(t => t.id === this.model.tipoVehiculoId);
    return tipo?.nombre ?? '';
  }

  onCancelar(): void {
    if (this.saving) return;
    this.router.navigate(['/vehiculos']);
  }

  onGuardar(): void {
    console.log('=== onGuardar() INICIADO ===');
    console.log('Modelo actual:', this.model);

    if (this.saving) {
      console.log('Se canceló porque saving ya estaba en true');
      return;
    }

    this.nombreVehiculoTouched = true;
    this.marcaTouched = true;
    this.modeloTouched = true;
    this.anioTouched = true;
    this.tipoTouched = true;
    this.statusTouched = true;
    this.inicioEstadisticasTouched = true;
    this.medidaUsoTouched = true;
    this.medidaCombTouched = true;

    this.grupoTouched = true;
    this.divisionTouched = true;
    this.serieTouched = true;
    this.placaTouched = true;
    this.colorTouched = true;
    this.companiaTouched = true;
    this.polizaTouched = true;

    this.errorMessage = '';

    const validaciones = {
      nombreVehiculo: this.isValidNombreVehiculo(this.model.nombreVehiculo),
      marca: this.isValidMarca(this.model.marca),
      modelo: this.isValidModelo(this.model.modelo),
      anio: this.isValidAnio(this.model.anio),
      tipoVehiculoId: this.isValidTipo(this.model.tipoVehiculoId),
      statusInicial: this.isValidStatus(this.model.statusInicial),
      inicioEstadisticas: this.isValidInicioEstadisticas(this.model.inicioEstadisticas),
      medidaUso: this.isValidMedidaUso(this.model.medidaUso),
      medidaCombustible: this.isValidMedidaComb(this.model.medidaCombustible),
      grupo: this.isValidGrupo(this.model.grupo),
      division: this.isValidDivision(this.model.division),
      numeroSerie: this.isValidSerie(this.model.numeroSerie),
      placa: this.isValidPlaca(this.model.placa),
      color: this.isValidColor(this.model.color),
      companiaSeguros: this.isValidCompania(this.model.companiaSeguros),
      polizaSeguro: this.isValidPoliza(this.model.polizaSeguro),
    };

    console.log('Validaciones:', validaciones);

    const ok = Object.values(validaciones).every(v => v);

    if (!ok) {
      console.warn('Formulario inválido. No se enviará al backend.');
      this.errorMessage = 'Revisa los campos marcados antes de guardar.';
      return;
    }

    const payloadBase: CrearVehiculoRequest = {
      nombreVehiculo: this.model.nombreVehiculo.trim(),
      marca: this.model.marca.trim(),
      modelo: this.model.modelo.trim(),
      anio: this.model.anio!,
      tipoVehiculoId: this.model.tipoVehiculoId!,
      statusInicial: this.model.statusInicial.trim(),
      inicioEstadisticas: this.model.inicioEstadisticas,
      medidaUso: this.model.medidaUso,
      medidaCombustible: this.model.medidaCombustible,
      grupo: this.normalizeOptional(this.model.grupo),
      division: this.normalizeOptional(this.model.division),
      numeroSerie: this.normalizeOptional(this.model.numeroSerie),
      placa: this.normalizeOptional(this.model.placa),
      color: this.normalizeOptional(this.model.color),
      companiaSeguros: this.normalizeOptional(this.model.companiaSeguros),
      polizaSeguro: this.normalizeOptional(this.model.polizaSeguro),
    };

    console.log('Payload a enviar:', payloadBase);

    this.saving = true;
    console.log('saving = true');

    if (this.isEditMode && this.model.id) {
      const payload: EditarVehiculoRequest = {
        id: this.model.id,
        activo: this.model.activo,
        ...payloadBase,
      };

      console.log('Enviando PUT:', payload);

      this.vehiculosService.editarVehiculo(payload).subscribe({
        next: (response) => {
          console.log('PUT exitoso:', response);
          this.saving = false;
          this.router.navigate(['/vehiculos']);
        },
        error: (error) => {
          console.error('Error al actualizar vehículo:', error);
          this.errorMessage =
            error?.error?.mensaje ||
            error?.error?.title ||
            'No se pudo actualizar el vehículo.';
          this.saving = false;
        }
      });

      return;
    }

    console.log('Enviando POST:', payloadBase);

    this.vehiculosService.crearVehiculo(payloadBase).subscribe({
      next: (response) => {
        console.log('POST exitoso:', response);
        this.saving = false;
        this.router.navigate(['/vehiculos']);
      },
      error: (error) => {
        console.error('Error al crear vehículo:', error);
        this.errorMessage =
          error?.error?.mensaje ||
          error?.error?.title ||
          'No se pudo crear el vehículo.';
        this.saving = false;
      }
    });
  }
}