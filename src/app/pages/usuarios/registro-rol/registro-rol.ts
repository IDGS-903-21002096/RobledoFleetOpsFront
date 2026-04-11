import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { CabeceraComponent } from '../../../components/cabecera/cabecera';
import { FooterComponent } from '../../../components/footer/footer';
import {
  RolesService,
  Rol,
  GuardarRolRequest,
  CatalogoPermisos,
} from '../../../../services/roles.service';

interface RolFormModel {
  id: number | null;
  nombre: string;
  descripcion: string;
  activo: boolean;
  permisos: string[];
}

@Component({
  selector: 'app-registro-rol',
  standalone: true,
  imports: [CommonModule, FormsModule, CabeceraComponent, FooterComponent],
  templateUrl: './registro-rol.html',
  styleUrl: './registro-rol.scss',
})
export class RegistroRolComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private rolesService = inject(RolesService);

  isEditMode: boolean = false;
  submitted: boolean = false;
  isSystemAdminRole: boolean = false;

  loading: boolean = false;
  saving: boolean = false;
  errorMessage: string = '';

  form: RolFormModel = {
    id: null,
    nombre: '',
    descripcion: '',
    activo: true,
    permisos: [],
  };

  modulos: CatalogoPermisos[] = [];

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!idParam;

    this.cargarPantalla(idParam ? Number(idParam) : null);
  }

  get selectedCount(): number {
    return this.form.permisos.length;
  }

  private normalize(text: string): string {
    return (text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  private isAdminNombre(nombre: string): boolean {
    return this.normalize(nombre) === 'administrador';
  }

  private resetFormForCreate(): void {
    this.submitted = false;
    this.isSystemAdminRole = false;

    this.form = {
      id: null,
      nombre: '',
      descripcion: '',
      activo: true,
      permisos: [],
    };
  }

  private cargarPantalla(id: number | null): void {
    this.loading = true;
    this.errorMessage = '';

    this.rolesService.getCatalogoPermisos().subscribe({
      next: (catalogo) => {
        this.modulos = catalogo ?? [];

        if (id) {
          this.cargarRolParaEdicion(id);
        } else {
          this.resetFormForCreate();
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Error al cargar catálogo de permisos:', error);
        this.errorMessage = 'No se pudo cargar el catálogo de permisos.';
        this.loading = false;
      },
    });
  }

  private cargarRolParaEdicion(id: number): void {
    this.rolesService.getRolById(id).subscribe({
      next: (rol: Rol) => {
        this.submitted = false;

        this.form = {
          id: rol.id,
          nombre: rol.nombre,
          descripcion: rol.descripcion,
          activo: rol.activo,
          permisos: [...rol.permisos],
        };

        this.isSystemAdminRole = !!rol.esSistema || this.isAdminNombre(rol.nombre);

        if (this.isSystemAdminRole) {
          this.form.activo = true;
        }

        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar rol para edición:', error);
        this.errorMessage = 'No se pudo cargar la información del rol.';
        this.loading = false;
      },
    });
  }

  hasPermiso(code: string): boolean {
    return this.form.permisos.includes(code);
  }

  togglePermiso(code: string): void {
    if (this.hasPermiso(code)) {
      this.form.permisos = this.form.permisos.filter((x) => x !== code);
    } else {
      this.form.permisos = [...this.form.permisos, code];
    }
  }

  selectAll(modKey: string): void {
    const mod = this.modulos.find((m) => m.key === modKey);
    if (!mod) return;

    const set = new Set(this.form.permisos);
    mod.permisos.forEach((p) => set.add(p.code));
    this.form.permisos = Array.from(set);
  }

  clearAll(modKey: string): void {
    const mod = this.modulos.find((m) => m.key === modKey);
    if (!mod) return;

    const remove = new Set(mod.permisos.map((p) => p.code));
    this.form.permisos = this.form.permisos.filter((p) => !remove.has(p));
  }

  onRegresar(): void {
    if (this.saving) return;
    this.router.navigate(['/usuarios/roles']);
  }

  onGuardar(): void {
    this.submitted = true;
    this.errorMessage = '';

    if (!this.form.nombre || !this.form.nombre.trim()) return;

    if (this.isSystemAdminRole) {
      this.form.activo = true;
    }

    const payload: GuardarRolRequest = {
      id: this.isEditMode ? this.form.id : null,
      nombre: this.form.nombre.trim(),
      descripcion: (this.form.descripcion || '').trim(),
      activo: this.form.activo,
      permisos: [...this.form.permisos].sort(),
    };

    this.saving = true;

    const request$ = this.isEditMode
      ? this.rolesService.editarRol(payload)
      : this.rolesService.crearRol(payload);

    request$.subscribe({
      next: () => {
        this.saving = false;
        this.router.navigate(['/usuarios/roles']);
      },
      error: (error) => {
        console.error('Error al guardar rol:', error);
        this.errorMessage = error?.error?.mensaje || 'No se pudo guardar el rol.';
        this.saving = false;
      },
    });
  }
}