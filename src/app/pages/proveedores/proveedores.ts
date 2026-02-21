import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { CabeceraComponent } from '../../components/cabecera/cabecera';
import { FooterComponent } from '../../components/footer/footer';

type TipoProveedor = 'Refacciones' | 'Servicios' | 'Ambos';

type ProveedorCard = {
  id: number;
  nombre: string; // Nombre comercial
  telefono: string;
  email?: string; // opcional
  estatus: 'ACTIVO' | 'INACTIVO';

  // Opcionales (por cambios del registro)
  tipo?: TipoProveedor;
  contacto?: string;
  telefonoContacto?: string;
  correoContacto?: string;

  // Dirección (opcional) - usado por buildDireccion() en el modal
  calle?: string;
  numero?: string;
  colonia?: string;
  ciudad?: string;
  estado?: string;
  cp?: string;
};

@Component({
  selector: 'app-proveedores',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CabeceraComponent, FooterComponent],
  templateUrl: './proveedores.html',
})
export class ProveedoresComponent {
  search = '';
  pageSize = 12;

  // Modal detalle
  isDetalleOpen = false;
  selectedProveedor: ProveedorCard | null = null;

  // Mock data (luego lo conectamos a la API)
  proveedores: ProveedorCard[] = [
    {
      id: 1,
      nombre: 'Refacciones del Bajío',
      telefono: '477 123 4567',
      email: 'ventas@refaccionesbajio.com',
      estatus: 'ACTIVO',
      tipo: 'Refacciones',
      contacto: 'Laura Martínez',
      telefonoContacto: '477 555 1122',
      correoContacto: 'contacto@refaccionesbajio.com',
      calle: 'Blvd. Principal',
      numero: '123',
      colonia: 'Centro',
      ciudad: 'León',
      estado: 'Guanajuato',
      cp: '37000',
    },
    {
      id: 2,
      nombre: 'Servicios Mecánicos León',
      telefono: '477 765 4321',
      email: '', // opcional
      estatus: 'INACTIVO',
      tipo: 'Servicios',
      contacto: 'Carlos Pérez',
      telefonoContacto: '477 222 3344',
      correoContacto: 'carlos@servmecanicosleon.com',
      ciudad: 'León',
      estado: 'Guanajuato',
    },
    {
      id: 3,
      nombre: 'Aceites y Lubricantes del Centro',
      telefono: '477 111 2233',
      email: 'contacto@lubricantescentro.com',
      estatus: 'ACTIVO',
      tipo: 'Ambos',
      contacto: 'María López',
      telefonoContacto: '477 777 8899',
      correoContacto: 'maria@lubricantescentro.com',
      colonia: 'San Juan',
      ciudad: 'León',
      estado: 'Guanajuato',
      cp: '37100',
    },
  ];

  constructor(private router: Router) {}

  filteredProveedores(): ProveedorCard[] {
    const q = this.search.trim().toLowerCase();

    const list = !q
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
            // dirección también ayuda al buscador (opcional)
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

    return list.slice(0, this.pageSize);
  }

  // ===== Modal detalle =====

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

  // ===== Acciones =====

  onAgregarProveedor(): void {
    this.router.navigate(['/proveedores/nuevo']);
  }

  onEditar(p: ProveedorCard): void {
    this.router.navigate(['/proveedores', p.id, 'editar']);
  }

  onEliminar(p: ProveedorCard): void {
    console.log('Eliminar', p);
  }
}
