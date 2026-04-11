import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { CabeceraComponent } from '../../components/cabecera/cabecera';
import { FooterComponent } from '../../components/footer/footer';
import { Proveedor, ProveedoresService } from '../../../services/proveedores.service';

type TipoProveedor = 'Refacciones' | 'Servicios' | 'Ambos';

type ProveedorCard = {
  id: number;
  nombre: string;
  telefono: string;
  email?: string;
  estatus: 'ACTIVO' | 'INACTIVO';
  tipo?: TipoProveedor;
  contacto?: string;
  telefonoContacto?: string;
  correoContacto?: string;
  calle?: string;
  numero?: string;
  colonia?: string;
  ciudad?: string;
  estado?: string;
  cp?: string;
};

type EstadoFiltro = 'ACTIVOS' | 'INACTIVOS';

@Component({
  selector: 'app-proveedores',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CabeceraComponent, FooterComponent],
  templateUrl: './proveedores.html',
})
export class ProveedoresComponent implements OnInit {
  private router = inject(Router);
  private proveedoresService = inject(ProveedoresService);

  search = '';
  page = 1;
  pageSize = 5;

  loading = false;
  errorMessage = '';

  estadoFiltro: EstadoFiltro = 'ACTIVOS';

  isDetalleOpen = false;
  selectedProveedor: ProveedorCard | null = null;

  proveedores: ProveedorCard[] = [];

  ngOnInit(): void {
    this.cargarProveedores();
  }

  cargarProveedores(): void {
    this.loading = true;
    this.errorMessage = '';

    const request$ =
      this.estadoFiltro === 'ACTIVOS'
        ? this.proveedoresService.getProveedoresActivos()
        : this.proveedoresService.getProveedoresInactivos();

    request$.subscribe({
      next: (data) => {
        this.proveedores = (data ?? []).map((p) => this.mapProveedorToCard(p));
        this.page = 1;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar proveedores:', error);
        this.errorMessage = this.getLoadErrorMessage(error, 'los proveedores');
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

  private mapProveedorToCard(p: Proveedor): ProveedorCard {
    return {
      id: p.id,
      nombre: p.nombreComercial,
      telefono: p.telefono,
      email: p.email ?? '',
      estatus: p.activo ? 'ACTIVO' : 'INACTIVO',
      tipo: (p.tipo as TipoProveedor) ?? undefined,
      contacto: p.contacto ?? '',
      telefonoContacto: p.telefonoContacto ?? '',
      correoContacto: p.correoContacto ?? '',
      calle: p.calle ?? '',
      numero: p.numero ?? '',
      colonia: p.colonia ?? '',
      ciudad: p.ciudad ?? '',
      estado: p.estado ?? '',
      cp: p.cp ?? '',
    };
  }

  filteredProveedores(): ProveedorCard[] {
    const q = this.search.trim().toLowerCase();

    return !q
      ? this.proveedores
      : this.proveedores.filter((p) => {
          const blob = [
            p.nombre,
            p.telefono,
            p.email ?? '',
            p.estatus,
            p.tipo ?? '',
            p.contacto ?? '',
            p.telefonoContacto ?? '',
            p.correoContacto ?? '',
            p.calle ?? '',
            p.numero ?? '',
            p.colonia ?? '',
            p.ciudad ?? '',
            p.estado ?? '',
            p.cp ?? '',
          ]
            .join(' ')
            .toLowerCase();

          return blob.includes(q);
        });
  }

  paginatedProveedores(): ProveedorCard[] {
    const start = (this.page - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredProveedores().slice(start, end);
  }

  get totalPages(): number {
    const total = this.filteredProveedores().length;
    return Math.max(1, Math.ceil(total / this.pageSize));
  }

  get inicioRango(): number {
    const total = this.filteredProveedores().length;
    if (total === 0) return 0;
    return (this.page - 1) * this.pageSize + 1;
  }

  get finRango(): number {
    const total = this.filteredProveedores().length;
    if (total === 0) return 0;
    return Math.min(this.page * this.pageSize, total);
  }

  onSearchChange(): void {
    this.page = 1;
  }

  cambiarPageSize(): void {
    this.page = 1;
  }

  prevPage(): void {
    if (this.page <= 1) return;
    this.page -= 1;
  }

  nextPage(): void {
    if (this.page >= this.totalPages) return;
    this.page += 1;
  }

  openDetalle(p: ProveedorCard): void {
    this.selectedProveedor = p;
    this.isDetalleOpen = true;
  }

  closeDetalle(): void {
    this.isDetalleOpen = false;
    this.selectedProveedor = null;
  }

  buildDireccion(p: ProveedorCard | null): string {
    if (!p) return '—';

    const parts = [
      p.calle ?? '',
      p.numero ?? '',
      p.colonia ?? '',
      p.ciudad ?? '',
      p.estado ?? '',
      p.cp ?? '',
    ]
      .map((x) => (x || '').trim())
      .filter(Boolean);

    return parts.length ? parts.join(', ') : '—';
  }

  onAgregarProveedor(): void {
    this.router.navigate(['/proveedores/nuevo']);
  }

  onEditar(p: ProveedorCard): void {
    this.router.navigate(['/proveedores', p.id, 'editar']);
  }

  onCambiarFiltro(estado: EstadoFiltro): void {
    if (this.estadoFiltro === estado) return;

    this.estadoFiltro = estado;
    this.page = 1;
    this.closeDetalle();
    this.cargarProveedores();
  }

  onEliminar(p: ProveedorCard): void {
    const confirmar = confirm(`¿Deseas inactivar al proveedor "${p.nombre}"?`);
    if (!confirmar) return;

    this.proveedoresService.inactivarProveedor(p.id).subscribe({
      next: () => {
        this.closeDetalle();
        this.cargarProveedores();
      },
      error: (error) => {
        console.error('Error al inactivar proveedor:', error);
        alert(error?.error?.mensaje || 'No se pudo inactivar el proveedor.');
      }
    });
  }

  onReactivar(p: ProveedorCard): void {
    const confirmar = confirm(`¿Deseas reactivar al proveedor "${p.nombre}"?`);
    if (!confirmar) return;

    this.proveedoresService.reactivarProveedor(p.id).subscribe({
      next: () => {
        this.closeDetalle();
        this.cargarProveedores();
      },
      error: (error) => {
        console.error('Error al reactivar proveedor:', error);
        alert(error?.error?.mensaje || 'No se pudo reactivar el proveedor.');
      }
    });
  }
}