import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { CabeceraComponent } from '../../../components/cabecera/cabecera';
import { FooterComponent } from '../../../components/footer/footer';

interface TipoForm {
  id: number | null;
  nombre: string;
  descripcion: string;
  activo: boolean;
}

interface TipoMock {
  id: number;
  nombre: string;
  descripcion: string;
  enUso: number;
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
  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  isEditMode: boolean = false;
  submitted: boolean = false;

  form: TipoForm = {
    id: null,
    nombre: '',
    descripcion: '',
    activo: true,
  };

  private tiposMock: TipoMock[] = [
    { id: 1, nombre: 'Automóvil', descripcion: 'Vehículo ligero.', enUso: 10, activo: true },
    { id: 2, nombre: 'Camioneta', descripcion: 'Unidades tipo pickup/van.', enUso: 7, activo: true },
    { id: 3, nombre: 'Autobús', descripcion: 'Transporte de personal.', enUso: 24, activo: true },
    { id: 4, nombre: 'Camión', descripcion: 'Carga ligera/mediana.', enUso: 3, activo: true },
    { id: 5, nombre: 'Van', descripcion: 'Unidades van.', enUso: 26, activo: true },
    { id: 6, nombre: 'Tráiler', descripcion: 'Unidad articulada.', enUso: 12, activo: true },
  ];

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
    const found = this.tiposMock.find((t) => t.id === id);

    if (!found) {
      this.router.navigate(['/vehiculos/tipos']);
      return;
    }

    this.submitted = false;

    this.form = {
      id: found.id,
      nombre: found.nombre,
      descripcion: found.descripcion,
      activo: found.activo,
    };
  }

  onRegresar(): void {
    this.router.navigate(['/vehiculos/tipos']);
  }

  onGuardar(): void {
    this.submitted = true;

    if (!this.form.nombre || !this.form.nombre.trim()) return;

    const payload = {
      ...this.form,
      nombre: this.form.nombre.trim(),
      descripcion: (this.form.descripcion || '').trim(),
    };

    console.log('[RegistroTipo] Guardar:', payload);

    this.router.navigate(['/vehiculos/tipos']);
  }
}