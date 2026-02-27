import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { CabeceraComponent } from '../../../components/cabecera/cabecera';
import { FooterComponent } from '../../../components/footer/footer';

type ModuloKey = 'usuarios' | 'roles' | 'vehiculos' | 'inventario' | 'mantenimientos';

interface PermisoDef {
  code: string;
  label: string;
  help: string;
}

interface ModuloPermisos {
  key: ModuloKey;
  titulo: string;
  descripcion: string;
  permisos: PermisoDef[];
}

interface RolFormModel {
  id: number | null;
  nombre: string;
  descripcion: string;
  activo: boolean;
  permisos: string[];
}

interface RolMock {
  id: number;
  nombre: string;
  descripcion: string;
  permisos: string[];
  activo: boolean;
}

@Component({
  selector: 'app-registro-rol',
  standalone: true,
  imports: [CommonModule, FormsModule, CabeceraComponent, FooterComponent],
  templateUrl: './registro-rol.html',
  styleUrl: './registro-rol.scss',
})
export class RegistroRolComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  // =========================
  // Mode
  // =========================
  isEditMode: boolean = false;
  submitted: boolean = false;

  // Para reglas de sistema (ej. Admin)
  isSystemAdminRole: boolean = false;

  // =========================
  // Form
  // =========================
  form: RolFormModel = {
    id: null,
    nombre: '',
    descripcion: '',
    activo: true,
    permisos: [],
  };

  // =========================
  // Mock roles (por ahora)
  // =========================
  private rolesMock: RolMock[] = [
    {
      id: 1,
      nombre: 'Administrador',
      descripcion: 'Acceso total al sistema. Puede realizar cualquier acción.',
      permisos: [
        'usuarios.ver', 'usuarios.crear', 'usuarios.editar', 'usuarios.eliminar',
        'roles.ver', 'roles.crear', 'roles.editar', 'roles.eliminar',
        'vehiculos.ver', 'vehiculos.crear', 'vehiculos.editar', 'vehiculos.eliminar', 'vehiculos.documentos.cargar',
        'inventario.ver', 'inventario.crear', 'inventario.editar', 'inventario.eliminar',
        'mantenimientos.ver', 'mantenimientos.crear', 'mantenimientos.editar', 'mantenimientos.aprobar', 'mantenimientos.cerrar',
      ],
      activo: true,
    },
    {
      id: 2,
      nombre: 'Gerencia',
      descripcion: 'Consulta información y puede solicitar/aprobar mantenimientos.',
      permisos: [
        'usuarios.ver',
        'roles.ver',
        'vehiculos.ver',
        'inventario.ver',
        'mantenimientos.ver',
        'mantenimientos.crear',
        'mantenimientos.aprobar',
      ],
      activo: true,
    },
    {
      id: 3,
      nombre: 'Monitoreo',
      descripcion: 'Solo consulta información del sistema.',
      permisos: [
        'usuarios.ver',
        'roles.ver',
        'vehiculos.ver',
        'inventario.ver',
        'mantenimientos.ver',
      ],
      activo: true,
    },
  ];

  // =========================
  // Catálogo permisos
  // =========================
  modulos: ModuloPermisos[] = [
    {
      key: 'usuarios',
      titulo: 'Usuarios',
      descripcion: 'Gestión de usuarios del sistema.',
      permisos: [
        { code: 'usuarios.ver', label: 'Ver', help: 'Consultar listado y detalle.' },
        { code: 'usuarios.crear', label: 'Crear', help: 'Registrar nuevos usuarios.' },
        { code: 'usuarios.editar', label: 'Editar', help: 'Modificar información de usuarios.' },
        { code: 'usuarios.eliminar', label: 'Eliminar', help: 'Eliminar/dar de baja usuarios.' },
      ],
    },
    {
      key: 'roles',
      titulo: 'Roles',
      descripcion: 'Definición de roles y permisos.',
      permisos: [
        { code: 'roles.ver', label: 'Ver', help: 'Consultar roles existentes.' },
        { code: 'roles.crear', label: 'Crear', help: 'Crear nuevos roles.' },
        { code: 'roles.editar', label: 'Editar', help: 'Modificar roles y permisos.' },
        { code: 'roles.eliminar', label: 'Eliminar', help: 'Eliminar roles (si aplica).' },
      ],
    },
    {
      key: 'vehiculos',
      titulo: 'Vehículos',
      descripcion: 'Gestión y control de unidades.',
      permisos: [
        { code: 'vehiculos.ver', label: 'Ver', help: 'Consultar listado y detalle.' },
        { code: 'vehiculos.crear', label: 'Crear', help: 'Registrar nuevas unidades.' },
        { code: 'vehiculos.editar', label: 'Editar', help: 'Modificar información de unidades.' },
        { code: 'vehiculos.eliminar', label: 'Eliminar', help: 'Eliminar/dar de baja unidades.' },
        { code: 'vehiculos.documentos.cargar', label: 'Documentos', help: 'Cargar/gestionar documentos.' },
      ],
    },
    {
      key: 'inventario',
      titulo: 'Inventario',
      descripcion: 'Artículos, existencias y costos.',
      permisos: [
        { code: 'inventario.ver', label: 'Ver', help: 'Consultar inventario.' },
        { code: 'inventario.crear', label: 'Crear', help: 'Registrar artículos.' },
        { code: 'inventario.editar', label: 'Editar', help: 'Modificar artículos.' },
        { code: 'inventario.eliminar', label: 'Eliminar', help: 'Eliminar artículos.' },
      ],
    },
    {
      key: 'mantenimientos',
      titulo: 'Mantenimientos',
      descripcion: 'Solicitudes, órdenes y seguimiento.',
      permisos: [
        { code: 'mantenimientos.ver', label: 'Ver', help: 'Consultar mantenimientos.' },
        { code: 'mantenimientos.crear', label: 'Solicitar', help: 'Crear solicitudes de mantenimiento.' },
        { code: 'mantenimientos.editar', label: 'Editar', help: 'Modificar información del mantenimiento.' },
        { code: 'mantenimientos.aprobar', label: 'Aprobar', help: 'Autorizar solicitudes (Gerencia).' },
        { code: 'mantenimientos.cerrar', label: 'Cerrar', help: 'Finalizar mantenimientos (Taller).' },
      ],
    },
  ];

  // =========================
  // Lifecycle
  // =========================
  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      const id = Number(idParam);
      this.isEditMode = true;
      this.loadRolForEdit(id);
    } else {
      this.isEditMode = false;
      this.isSystemAdminRole = false;
      this.resetFormForCreate();
    }
  }

  // =========================
  // Computed
  // =========================
  get selectedCount(): number {
    return this.form.permisos.length;
  }

  // =========================
  // Helpers
  // =========================
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
    this.form = {
      id: null,
      nombre: '',
      descripcion: '',
      activo: true,
      permisos: [],
    };
  }

  private loadRolForEdit(id: number): void {
    const found = this.rolesMock.find((r) => r.id === id);

    if (!found) {
      // Si no existe, regresamos al listado para evitar pantalla rara
      this.router.navigate(['/usuarios/roles']);
      return;
    }

    this.submitted = false;

    this.form = {
      id: found.id,
      nombre: found.nombre,
      descripcion: found.descripcion,
      activo: found.activo,
      permisos: [...found.permisos],
    };

    this.isSystemAdminRole = this.isAdminNombre(found.nombre);

    // Regla: Administrador siempre activo
    if (this.isSystemAdminRole) {
      this.form.activo = true;
    }
  }

  // =========================
  // Permisos
  // =========================
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

  selectAll(modKey: ModuloKey): void {
    const mod = this.modulos.find((m) => m.key === modKey);
    if (!mod) return;

    const set = new Set(this.form.permisos);
    mod.permisos.forEach((p) => set.add(p.code));
    this.form.permisos = Array.from(set);
  }

  clearAll(modKey: ModuloKey): void {
    const mod = this.modulos.find((m) => m.key === modKey);
    if (!mod) return;

    const remove = new Set(mod.permisos.map((p) => p.code));
    this.form.permisos = this.form.permisos.filter((p) => !remove.has(p));
  }

  // =========================
  // Navigation / Save
  // =========================
  onRegresar(): void {
    this.router.navigate(['/usuarios/roles']);
  }

  onGuardar(): void {
    this.submitted = true;

    // Validación mínima
    if (!this.form.nombre || !this.form.nombre.trim()) return;

    // Regla: si es Admin, no permitir desactivar
    if (this.isSystemAdminRole) {
      this.form.activo = true;
    }

    const payload: RolFormModel = {
      ...this.form,
      nombre: this.form.nombre.trim(),
      descripcion: (this.form.descripcion || '').trim(),
      permisos: [...this.form.permisos].sort(),
    };

    console.log('[RegistroRol] Guardar:', payload);

    // Por ahora no persistimos (sin backend). Regresamos al listado.
    this.router.navigate(['/usuarios/roles']);
  }
}