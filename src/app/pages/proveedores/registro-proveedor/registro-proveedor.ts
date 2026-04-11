import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { CabeceraComponent } from '../../../components/cabecera/cabecera';
import { FooterComponent } from '../../../components/footer/footer';
import {
  CrearProveedorRequest,
  EditarProveedorRequest,
  Proveedor,
  ProveedoresService
} from '../../../../services/proveedores.service';

type TipoProveedor = 'Refacciones' | 'Servicios' | 'Ambos';

type ProveedorFormModel = {
  id?: number;
  nombreComercial: string;
  telefono: string;
  email?: string;
  tipo: TipoProveedor | '';

  calle?: string;
  numero?: string;
  colonia?: string;
  ciudad?: string;
  estado?: string;
  cp?: string;

  contacto?: string;
  telefonoContacto?: string;
  correoContacto?: string;
};

@Component({
  selector: 'app-registro-proveedor',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CabeceraComponent, FooterComponent],
  templateUrl: './registro-proveedor.html',
})
export class RegistroProveedorComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private proveedoresService = inject(ProveedoresService);

  tiposProveedor: TipoProveedor[] = ['Refacciones', 'Servicios', 'Ambos'];

  isEdit = false;
  proveedorId: number | null = null;

  loading = false;
  saving = false;
  errorMessage = '';

  model: ProveedorFormModel = this.createEmptyModel();

  nombreComercialTouched = false;
  telefonoTouched = false;
  emailTouched = false;
  tipoTouched = false;

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.proveedorId = idParam ? Number(idParam) : null;

    if (this.proveedorId && !Number.isNaN(this.proveedorId)) {
      this.isEdit = true;
      this.cargarProveedor(this.proveedorId);
    }
  }

  private cargarProveedor(id: number): void {
    this.loading = true;
    this.errorMessage = '';

    this.proveedoresService.getProveedorById(id).subscribe({
      next: (proveedor: Proveedor) => {
        this.model = {
          id: proveedor.id,
          nombreComercial: proveedor.nombreComercial ?? '',
          telefono: proveedor.telefono ?? '',
          email: proveedor.email ?? '',
          tipo: (proveedor.tipo as TipoProveedor) ?? '',
          calle: proveedor.calle ?? '',
          numero: proveedor.numero ?? '',
          colonia: proveedor.colonia ?? '',
          ciudad: proveedor.ciudad ?? '',
          estado: proveedor.estado ?? '',
          cp: proveedor.cp ?? '',
          contacto: proveedor.contacto ?? '',
          telefonoContacto: proveedor.telefonoContacto ?? '',
          correoContacto: proveedor.correoContacto ?? '',
        };

        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar proveedor:', error);
        this.errorMessage = error?.error?.mensaje || 'No se pudo cargar el proveedor.';
        this.loading = false;
      }
    });
  }

  isValidNombreComercial(v: string): boolean {
    return (v ?? '').trim().length >= 2;
  }

  isValidTelefono(v: string): boolean {
    const digits = (v ?? '').replace(/\D/g, '');
    return digits.length >= 10;
  }

  isValidEmail(v: string): boolean {
    const email = (v ?? '').trim().toLowerCase();
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  }

  isValidTipo(v: ProveedorFormModel['tipo']): boolean {
    return v === 'Refacciones' || v === 'Servicios' || v === 'Ambos';
  }

  onCancelar(): void {
    if (this.saving) return;
    this.router.navigate(['/proveedores']);
  }

  onGuardar(): void {
    this.nombreComercialTouched = true;
    this.telefonoTouched = true;
    this.tipoTouched = true;
    this.emailTouched = true;
    this.errorMessage = '';

    const emailCapturado = (this.model.email ?? '').trim();

    const ok =
      this.isValidNombreComercial(this.model.nombreComercial) &&
      this.isValidTelefono(this.model.telefono) &&
      this.isValidTipo(this.model.tipo) &&
      (emailCapturado === '' || this.isValidEmail(emailCapturado));

    if (!ok) return;

    this.saving = true;

    const payloadBase = {
      nombreComercial: this.model.nombreComercial.trim(),
      telefono: this.model.telefono.trim(),
      email: (this.model.email ?? '').trim().toLowerCase() || null,
      tipo: this.model.tipo,
      calle: (this.model.calle ?? '').trim() || null,
      numero: (this.model.numero ?? '').trim() || null,
      colonia: (this.model.colonia ?? '').trim() || null,
      ciudad: (this.model.ciudad ?? '').trim() || null,
      estado: (this.model.estado ?? '').trim() || null,
      cp: (this.model.cp ?? '').trim() || null,
      contacto: (this.model.contacto ?? '').trim() || null,
      telefonoContacto: (this.model.telefonoContacto ?? '').trim() || null,
      correoContacto: (this.model.correoContacto ?? '').trim().toLowerCase() || null,
    };

    if (this.isEdit && this.model.id) {
      const payload: EditarProveedorRequest = {
        id: this.model.id,
        ...payloadBase,
      };

      this.proveedoresService.editarProveedor(payload).subscribe({
        next: () => {
          this.saving = false;
          this.router.navigate(['/proveedores']);
        },
        error: (error) => {
          console.error('Error al actualizar proveedor:', error);
          this.errorMessage = error?.error?.mensaje || 'No se pudo actualizar el proveedor.';
          this.saving = false;
        }
      });

      return;
    }

    const payload: CrearProveedorRequest = {
      ...payloadBase,
    };

    this.proveedoresService.crearProveedor(payload).subscribe({
      next: () => {
        this.saving = false;
        this.router.navigate(['/proveedores']);
      },
      error: (error) => {
        console.error('Error al crear proveedor:', error);
        this.errorMessage = error?.error?.mensaje || 'No se pudo crear el proveedor.';
        this.saving = false;
      }
    });
  }

  private createEmptyModel(): ProveedorFormModel {
    return {
      nombreComercial: '',
      telefono: '',
      email: '',
      tipo: '',
      calle: '',
      numero: '',
      colonia: '',
      ciudad: '',
      estado: '',
      cp: '',
      contacto: '',
      telefonoContacto: '',
      correoContacto: '',
    };
  }
}