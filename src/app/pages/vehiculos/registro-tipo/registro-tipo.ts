import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { CabeceraComponent } from '../../../components/cabecera/cabecera';
import { FooterComponent } from '../../../components/footer/footer';
import {
  GuardarTipoVehiculoRequest,
  TipoVehiculo,
  TiposVehiculoService
} from '../../../../services/tipos-vehiculo.service';

interface TipoForm {
  id: number | null;
  nombre: string;
  descripcion: string;
  activo: boolean;
}

@Component({
  selector: 'app-registro-tipo',
  standalone: true,
  imports: [CommonModule, FormsModule, CabeceraComponent, FooterComponent],
  templateUrl: './registro-tipo.html',
  styleUrl: './registro-tipo.scss',
})
export class RegistroTipoComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private tiposVehiculoService = inject(TiposVehiculoService);

  isEditMode: boolean = false;
  submitted: boolean = false;

  loading: boolean = false;
  saving: boolean = false;
  errorMessage: string = '';

  form: TipoForm = {
    id: null,
    nombre: '',
    descripcion: '',
    activo: true,
  };

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      const id = Number(idParam);
      this.isEditMode = true;
      this.loadForEdit(id);
    } else {
      this.isEditMode = false;
      this.resetForCreate();
    }
  }

  private resetForCreate(): void {
    this.submitted = false;
    this.form = {
      id: null,
      nombre: '',
      descripcion: '',
      activo: true,
    };
  }

  private loadForEdit(id: number): void {
    this.loading = true;
    this.errorMessage = '';

    this.tiposVehiculoService.getTipoById(id).subscribe({
      next: (tipo: TipoVehiculo) => {
        this.submitted = false;

        this.form = {
          id: tipo.id,
          nombre: tipo.nombre,
          descripcion: tipo.descripcion,
          activo: tipo.activo,
        };

        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar tipo de vehículo:', error);
        this.errorMessage = error?.error?.mensaje || 'No se pudo cargar el tipo de vehículo.';
        this.loading = false;
      }
    });
  }

  onRegresar(): void {
    if (this.saving) return;
    this.router.navigate(['/vehiculos/tipos']);
  }

  onGuardar(): void {
    this.submitted = true;
    this.errorMessage = '';

    if (!this.form.nombre || !this.form.nombre.trim()) return;

    const payload: GuardarTipoVehiculoRequest = {
      id: this.isEditMode ? this.form.id : null,
      nombre: this.form.nombre.trim(),
      descripcion: (this.form.descripcion || '').trim(),
      activo: this.form.activo,
    };

    this.saving = true;

    const request$ = this.isEditMode
      ? this.tiposVehiculoService.editarTipo(payload)
      : this.tiposVehiculoService.crearTipo(payload);

    request$.subscribe({
      next: () => {
        this.saving = false;
        this.router.navigate(['/vehiculos/tipos']);
      },
      error: (error) => {
        console.error('Error al guardar tipo de vehículo:', error);
        this.errorMessage = error?.error?.mensaje || 'No se pudo guardar el tipo de vehículo.';
        this.saving = false;
      }
    });
  }
}