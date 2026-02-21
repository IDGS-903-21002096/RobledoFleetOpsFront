import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { CabeceraComponent } from '../../../components/cabecera/cabecera';
import { FooterComponent } from '../../../components/footer/footer';

type TipoProveedor = 'Refacciones' | 'Servicios' | 'Ambos';

type ProveedorFormModel = {
  id?: number; // útil para edición
  nombreComercial: string;
  telefono: string;
  email?: string; // opcional
  tipo: TipoProveedor | '';

  // Dirección (opcional)
  calle?: string;
  numero?: string;
  colonia?: string;
  ciudad?: string;
  estado?: string;
  cp?: string;

  // Contacto (opcional)
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
export class RegistroProveedorComponent {
  // Catálogos
  tiposProveedor: TipoProveedor[] = ['Refacciones', 'Servicios', 'Ambos'];

  // Modo edición
  isEdit = false;
  proveedorId: number | null = null;

  // Modelo
  model: ProveedorFormModel = this.createEmptyModel();

  // Flags touched (validación visual)
  nombreComercialTouched = false;
  telefonoTouched = false;
  emailTouched = false;
  tipoTouched = false;

  constructor(private router: Router, private route: ActivatedRoute) {
    // Detectar edición por ruta: /proveedores/:id/editar
    const idParam = this.route.snapshot.paramMap.get('id');
    this.proveedorId = idParam ? Number(idParam) : null;

    if (this.proveedorId && !Number.isNaN(this.proveedorId)) {
      this.isEdit = true;

      // Mock de carga (luego API)
      this.model = {
        id: this.proveedorId,
        nombreComercial: 'Refacciones del Bajío',
        telefono: '477 123 4567',
        email: 'ventas@refaccionesbajio.com',
        tipo: 'Refacciones',
        calle: 'Blvd. Principal',
        numero: '123',
        colonia: 'Centro',
        ciudad: 'León',
        estado: 'Guanajuato',
        cp: '37000',
        contacto: 'Laura Martínez',
        telefonoContacto: '477 555 1122',
        correoContacto: 'contacto@refaccionesbajio.com',
      };
    }
  }

  // =========================
  // Validadores (HTML usa estos)
  // =========================

  isValidNombreComercial(v: string): boolean {
    return (v ?? '').trim().length >= 2;
  }

  isValidTelefono(v: string): boolean {
    const digits = (v ?? '').replace(/\D/g, '');
    return digits.length >= 10; // mínimo 10 dígitos (MX)
  }

  isValidEmail(v: string): boolean {
    const email = (v ?? '').trim().toLowerCase();
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  }

  isValidTipo(v: ProveedorFormModel['tipo']): boolean {
    return v === 'Refacciones' || v === 'Servicios' || v === 'Ambos';
  }

  // =========================
  // Acciones
  // =========================

  onCancelar(): void {
    this.router.navigate(['/proveedores']);
  }

  onGuardar(): void {
    // Marcar como touched SOLO los obligatorios para mostrar validaciones
    this.nombreComercialTouched = true;
    this.telefonoTouched = true;
    this.tipoTouched = true;

    // Email es opcional: si viene lleno, se valida
    this.emailTouched = true;

    const emailCapturado = (this.model.email ?? '').trim();
    const ok =
      this.isValidNombreComercial(this.model.nombreComercial) &&
      this.isValidTelefono(this.model.telefono) &&
      this.isValidTipo(this.model.tipo) &&
      (emailCapturado === '' || this.isValidEmail(emailCapturado));

    if (!ok) {
      console.log('Formulario inválido', this.model);
      return;
    }

    // Normalizaciones básicas
    this.model.nombreComercial = this.model.nombreComercial.trim();

    if ((this.model.email ?? '').trim() !== '') {
      this.model.email = (this.model.email ?? '').trim().toLowerCase();
    } else {
      this.model.email = '';
    }

    if ((this.model.correoContacto ?? '').trim() !== '') {
      this.model.correoContacto = (this.model.correoContacto ?? '').trim().toLowerCase();
    } else {
      this.model.correoContacto = (this.model.correoContacto ?? '').trim();
    }

    // Mock submit (luego API)
    if (this.isEdit) {
      console.log('Actualizar proveedor', this.model);
    } else {
      console.log('Crear proveedor', this.model);
    }

    // Regresar al listado
    this.router.navigate(['/proveedores']);
  }

  // =========================
  // Helpers
  // =========================

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
