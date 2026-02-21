import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { CabeceraComponent } from '../../../components/cabecera/cabecera';
import { FooterComponent } from '../../../components/footer/footer';

type ModoRegistro = 'individual' | 'multiple';

interface ArticuloForm {
  codigo: string;
  nombre: string;
  modelo: string;
  puntoReorden: number | null;
  descripcion: string;
  grupo: string;
  unidad: string;
}

interface ArticuloRow extends ArticuloForm {}

@Component({
  selector: 'app-registro-articulo',
  standalone: true,
  imports: [CommonModule, FormsModule, CabeceraComponent, FooterComponent],
  templateUrl: './registro-articulo.html',
  styleUrl: './registro-articulo.scss',
})
export class RegistroArticuloComponent {
  modo: ModoRegistro = 'individual';

  // Catálogos (mock)
  grupos: string[] = ['HERRAMIENTA', 'REFACCIÓN', 'LUBRICANTE', 'CONSUMIBLE', 'OTRO'];
  unidades: string[] = ['pz', 'lt', 'kg', 'm', 'jgo', 'caja'];

  // Form individual
  form: ArticuloForm = this.getEmptyForm();

  // Tabla múltiple
  rows: ArticuloRow[] = [this.getEmptyForm()];

  // Validación UI
  intentoGuardar = false;
  intentoGuardarMultiple = false;

  // Mensajes UI
  msg = '';

  constructor(private router: Router) {}

  // -------------------------
  // Tabs
  // -------------------------
  setModo(m: ModoRegistro): void {
    this.msg = '';
    this.intentoGuardar = false;
    this.intentoGuardarMultiple = false;
    this.modo = m;
  }

  // -------------------------
  // Helpers
  // -------------------------
  private getEmptyForm(): ArticuloForm {
    return {
      codigo: '',
      nombre: '',
      modelo: '',
      puntoReorden: null,
      descripcion: '',
      grupo: '',
      unidad: '',
    };
  }

  private isValidArticulo(a: ArticuloForm): boolean {
    return !!a.codigo.trim() && !!a.nombre.trim() && !!a.grupo && !!a.unidad;
  }

  // -------------------------
  // Acciones Individual
  // -------------------------
  guardarIndividual(continuar: boolean): void {
    this.msg = '';
    this.intentoGuardar = true;

    if (!this.isValidArticulo(this.form)) {
      this.msg = 'Revisa los campos obligatorios.';
      return;
    }

    // Sin backend (mock)
    this.msg = continuar
      ? 'Artículo guardado (mock). Puedes capturar otro.'
      : 'Artículo guardado (mock).';

    if (continuar) {
      this.form = this.getEmptyForm();
      this.intentoGuardar = false;
      return;
    }

    // Si NO continuar: regresamos al listado (opcional)
    // this.router.navigate(['/inventario']);
  }

  // -------------------------
  // Acciones Múltiple
  // -------------------------
  agregarFila(): void {
    this.rows.push(this.getEmptyForm());
  }

  eliminarFila(index: number): void {
    this.rows.splice(index, 1);
    if (this.rows.length === 0) {
      this.rows.push(this.getEmptyForm());
    }
  }

  guardarMultiple(): void {
    this.msg = '';
    this.intentoGuardarMultiple = true;

    const validas = this.rows.filter(r => this.isValidArticulo(r));
    if (validas.length !== this.rows.length) {
      this.msg = 'Hay filas incompletas. Completa los campos obligatorios en cada fila.';
      return;
    }

    // Sin backend (mock)
    this.msg = `Se guardaron ${this.rows.length} artículo(s) (mock).`;

    // Limpiar
    this.rows = [this.getEmptyForm()];
    this.intentoGuardarMultiple = false;
  }

  // -------------------------
  // Navegación
  // -------------------------
  onCancelar(): void {
    // Regresar a inventario
    this.router.navigate(['/inventario']);
  }
}