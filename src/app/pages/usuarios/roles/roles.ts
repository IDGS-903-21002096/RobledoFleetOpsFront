import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { CabeceraComponent } from '../../../components/cabecera/cabecera';
import { FooterComponent } from '../../../components/footer/footer';
import { RolesService, Rol } from '../../../../services/roles.service';

type EstadoFiltro = 'TODOS' | 'ACTIVO' | 'INACTIVO';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, FormsModule, CabeceraComponent, FooterComponent],
  templateUrl: './roles.html',
  styleUrl: './roles.scss',
})
export class RolesComponent implements OnInit {
  private router = inject(Router);
  private rolesService = inject(RolesService);

  search: string = '';
  estadoFiltro: EstadoFiltro = 'TODOS';

  isDetalleOpen: boolean = false;
  selectedRol: Rol | null = null;

  loading: boolean = false;
  errorMessage: string = '';

  roles: Rol[] = [];

  ngOnInit(): void {
    this.cargarRoles();
  }

  cargarRoles(): void {
    this.loading = true;
    this.errorMessage = '';

    this.rolesService.getRoles().subscribe({
      next: (data) => {
        this.roles = data ?? [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar roles:', error);
        this.errorMessage = this.getLoadErrorMessage(error, 'los roles');
        this.loading = false;
      }
    });
  }

  private getLoadErrorMessage(error: any, recurso: string): string {
    const status = error?.status;

    if (status === 403) {
      return `Tu rol no tiene acceso a ${recurso}.`;
    }

    if (status === 401) {
      return 'Tu sesión no es válida o ha expirado. Inicia sesión nuevamente.';
    }

    if (status === 0) {
      return 'No fue posible conectar con el servidor.';
    }

    return `No se pudo cargar ${recurso}.`;
  }

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

  filteredRoles(): Rol[] {
    const q = this.normalize(this.search);

    return this.roles
      .filter((r) => {
        if (this.estadoFiltro === 'ACTIVO' && !r.activo) return false;
        if (this.estadoFiltro === 'INACTIVO' && r.activo) return false;

        if (!q) return true;

        const haystack = this.normalize(`${r.nombre} ${r.descripcion} ${r.permisos.join(' ')}`);
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

    const accion = r.activo ? 'desactivar' : 'activar';
    const confirmar = confirm(`¿Deseas ${accion} el rol "${r.nombre}"?`);

    if (!confirmar) return;

    this.rolesService.toggleEstadoRol(r.id).subscribe({
      next: () => {
        this.cargarRoles();

        if (this.selectedRol?.id === r.id) {
          this.closeDetalle();
        }
      },
      error: (error) => {
        console.error('Error al cambiar estado del rol:', error);
        alert(error?.error?.mensaje || 'No se pudo cambiar el estado del rol.');
      }
    });
  }
}