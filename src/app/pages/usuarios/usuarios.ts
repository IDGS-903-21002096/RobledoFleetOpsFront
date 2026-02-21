import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { CabeceraComponent } from '../../components/cabecera/cabecera';
import { FooterComponent } from '../../components/footer/footer';

type UsuarioCard = {
  id: number;
  nombre: string;
  rol: string;
  email: string;
  avatarUrl?: string;
};

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CabeceraComponent, FooterComponent],
  templateUrl: './usuarios.html',
})
export class UsuariosComponent {
  search = '';
  pageSize = 12;

  // Modal detalle
  isDetalleOpen = false;
  selectedUser: UsuarioCard | null = null;

  // Mock data (luego lo conectamos a la API)
  usuarios: UsuarioCard[] = [
    { id: 1, nombre: 'Administrador', rol: 'ADMINISTRADOR', email: 'admin@correo.com' },
    { id: 2, nombre: 'Usuario 1', rol: 'ROL 1', email: 'rol1@correo.com' },
    { id: 3, nombre: 'Usuario 2', rol: 'ROL 2', email: 'rol2@correo.com' },
    { id: 4, nombre: 'Usuario 3', rol: 'ROL 3', email: 'rol3@correo.com' },
  ];

  constructor(private router: Router) {}

  filteredUsers(): UsuarioCard[] {
    const q = this.search.trim().toLowerCase();

    const list = !q
      ? this.usuarios
      : this.usuarios.filter((u) => {
          return (
            u.nombre.toLowerCase().includes(q) ||
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

  // ===== Modal detalle =====

  openDetalle(u: UsuarioCard): void {
    this.selectedUser = u;
    this.isDetalleOpen = true;
  }

  closeDetalle(): void {
    this.isDetalleOpen = false;
    this.selectedUser = null;
  }

  // ===== Acciones =====

  onAgregarUsuario(): void {
    this.router.navigate(['/usuarios/nuevo']);
  }

  onEditar(u: UsuarioCard): void {
    this.router.navigate(['/usuarios', u.id, 'editar']);
  }

  onEliminar(u: UsuarioCard): void {
    console.log('Eliminar', u);
  }
}
