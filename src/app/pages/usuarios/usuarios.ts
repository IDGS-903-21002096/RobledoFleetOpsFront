import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { CabeceraComponent } from '../../components/cabecera/cabecera';
import { FooterComponent } from '../../components/footer/footer';
import { Usuario, UsuariosService } from '../../../services/usuarios.service';

type UsuarioCard = {
  id: number;
  nombre: string;
  nombreCompleto: string;
  rol: string;
  email: string;
  avatarUrl?: string;
  avatarKey: string;
  activo: boolean;
};

type EstadoFiltro = 'ACTIVOS' | 'INACTIVOS';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CabeceraComponent, FooterComponent],
  templateUrl: './usuarios.html',
})
export class UsuariosComponent implements OnInit {
  private router = inject(Router);
  private usuariosService = inject(UsuariosService);

  search = '';
  pageSize = 12;

  loading = false;
  errorMessage = '';

  estadoFiltro: EstadoFiltro = 'ACTIVOS';

  isDetalleOpen = false;
  selectedUser: UsuarioCard | null = null;

  usuarios: UsuarioCard[] = [];

  private readonly avatarExtensions: Record<string, string> = {
    av1: 'jpg',
    av2: 'png',
  };

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.loading = true;
    this.errorMessage = '';

    const request$ =
      this.estadoFiltro === 'ACTIVOS'
        ? this.usuariosService.getUsuariosActivos()
        : this.usuariosService.getUsuariosInactivos();

    request$.subscribe({
      next: (data) => {
        this.usuarios = (data ?? []).map((u) => this.mapUsuarioToCard(u));
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
        this.errorMessage = this.getLoadErrorMessage(error, 'los usuarios');
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

  private mapUsuarioToCard(u: Usuario): UsuarioCard {
    const nombreCompleto = `${u.nombre} ${u.apellidos}`.trim();

    return {
      id: u.id,
      nombre: u.nombre,
      nombreCompleto,
      rol: u.rolNombre,
      email: u.email,
      avatarKey: u.avatarKey,
      activo: u.activo,
      avatarUrl: this.getAvatarUrl(u.avatarKey)
    };
  }

  private getAvatarUrl(avatarKey: string): string | undefined {
    if (!avatarKey) return undefined;

    const extension = this.avatarExtensions[avatarKey];
    return extension ? `assets/avatars/${avatarKey}.${extension}` : undefined;
  }

  filteredUsers(): UsuarioCard[] {
    const q = this.search.trim().toLowerCase();

    const list = !q
      ? this.usuarios
      : this.usuarios.filter((u) => {
          return (
            u.nombreCompleto.toLowerCase().includes(q) ||
            u.rol.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q)
          );
        });

    return list.slice(0, this.pageSize);
  }

  initials(nombre: string): string {
    const parts = nombre.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? '';
    const second = parts.length > 1 ? parts[1][0] : (parts[0]?.[1] ?? '');
    return (first + second).toUpperCase();
  }

  openDetalle(u: UsuarioCard): void {
    this.selectedUser = u;
    this.isDetalleOpen = true;
  }

  closeDetalle(): void {
    this.isDetalleOpen = false;
    this.selectedUser = null;
  }

  onAgregarUsuario(): void {
    this.router.navigate(['/usuarios/nuevo']);
  }

  onEditar(u: UsuarioCard): void {
    this.router.navigate(['/usuarios', u.id, 'editar']);
  }

  onCambiarFiltro(estado: EstadoFiltro): void {
    if (this.estadoFiltro === estado) return;

    this.estadoFiltro = estado;
    this.closeDetalle();
    this.cargarUsuarios();
  }

  onEliminar(u: UsuarioCard): void {
    const confirmar = confirm(`¿Deseas desactivar al usuario "${u.nombreCompleto}"?`);
    if (!confirmar) return;

    this.usuariosService.desactivarUsuario(u.id).subscribe({
      next: () => {
        this.closeDetalle();
        this.cargarUsuarios();
      },
      error: (error) => {
        console.error('Error al desactivar usuario:', error);
        alert(error?.error?.mensaje || 'No se pudo desactivar el usuario.');
      }
    });
  }

  onReactivar(u: UsuarioCard): void {
    const confirmar = confirm(`¿Deseas reactivar al usuario "${u.nombreCompleto}"?`);
    if (!confirmar) return;

    this.usuariosService.reactivarUsuario(u.id).subscribe({
      next: () => {
        this.closeDetalle();
        this.cargarUsuarios();
      },
      error: (error) => {
        console.error('Error al reactivar usuario:', error);
        alert(error?.error?.mensaje || 'No se pudo reactivar el usuario.');
      }
    });
  }
}