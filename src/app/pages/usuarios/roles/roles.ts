import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { CabeceraComponent } from '../../../components/cabecera/cabecera';
import { FooterComponent } from '../../../components/footer/footer';

type EstadoFiltro = 'TODOS' | 'ACTIVO' | 'INACTIVO';

interface Rol {
  id: number;
  nombre: string;
  descripcion: string;
  permisos: string[];
  activo: boolean;
  esSistema?: boolean;
}

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, FormsModule, CabeceraComponent, FooterComponent],
  templateUrl: './roles.html',
  styleUrl: './roles.scss',
})
export class RolesComponent {
  constructor(private router: Router) {}

  // =========================
  // UI State
  // =========================
  search: string = '';
  estadoFiltro: EstadoFiltro = 'TODOS';

  isDetalleOpen: boolean = false;
  selectedRol: Rol | null = null;

  // =========================
  // Mock data
  // =========================
  roles: Rol[] = [
    {
      id: 1,
      nombre: 'Administrador',
      descripcion: 'Acceso total al sistema. Puede realizar cualquier acción.',
      permisos: [
        'usuarios.ver',
        'usuarios.crear',
        'usuarios.editar',
        'usuarios.eliminar',
        'roles.ver',
        'roles.crear',
        'roles.editar',
        'roles.eliminar',
        'vehiculos.ver',
        'vehiculos.crear',
        'vehiculos.editar',
        'vehiculos.eliminar',
        'vehiculos.documentos.cargar',
        'inventario.ver',
        'inventario.crear',
        'inventario.editar',
        'inventario.eliminar',
        'mantenimientos.ver',
        'mantenimientos.crear',
        'mantenimientos.editar',
        'mantenimientos.aprobar',
        'mantenimientos.cerrar',
      ],
      activo: true,
      esSistema: true,
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
      esSistema: false,
    },
    {
      id: 3,
      nombre: 'Monitoreo',
      descripcion: 'Solo consulta información del sistema.',
      permisos: ['usuarios.ver', 'roles.ver', 'vehiculos.ver', 'inventario.ver', 'mantenimientos.ver'],
      activo: true,
      esSistema: false,
    },
  ];

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

  private isAdminRol(rol: Rol): boolean {
    return this.normalize(rol.nombre) === 'administrador';
  }

  isProtectedRol(rol: Rol): boolean {
    return !!rol.esSistema || this.isAdminRol(rol);
  }

  // =========================
  // UI actions
  // =========================
  filteredRoles(): Rol[] {
    const q = this.normalize(this.search);

    return this.roles
      .filter((r) => {
        if (this.estadoFiltro === 'ACTIVO' && !r.activo) return false;
        if (this.estadoFiltro === 'INACTIVO' && r.activo) return false;

        if (!q) return true;

        const haystack = this.normalize(`${r.nombre} ${r.descripcion}`);
        return haystack.includes(q);
      })
      .sort((a, b) => {
        const aIsProtected = this.isProtectedRol(a);
        const bIsProtected = this.isProtectedRol(b);

        if (aIsProtected && !bIsProtected) return -1;
        if (!aIsProtected && bIsProtected) return 1;

        if (a.activo !== b.activo) return a.activo ? -1 : 1;

        return a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' });
      });
  }

  openDetalle(r: Rol): void {
    this.selectedRol = r;
    this.isDetalleOpen = true;
  }

  closeDetalle(): void {
    this.isDetalleOpen = false;
    this.selectedRol = null;
  }

  onCrearRol(): void {
    this.router.navigate(['/usuarios/roles/nuevo']);
  }

  onEditar(r: Rol): void {
    this.router.navigate(['/usuarios/roles', r.id, 'editar']);
  }

  onToggleEstado(r: Rol): void {
    if (this.isProtectedRol(r)) {
      alert('Este rol está protegido y no se puede desactivar.');
      return;
    }

    r.activo = !r.activo;
    console.log('[Roles] Estado actualizado:', r.nombre, r.activo ? 'Activo' : 'Inactivo');
  }
}