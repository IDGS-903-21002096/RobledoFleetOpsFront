import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { CabeceraComponent } from '../../../components/cabecera/cabecera';
import { FooterComponent } from '../../../components/footer/footer';

import {
  ArticulosInventarioService,
  CrearArticuloInventarioMultipleRequest,
  CrearArticuloInventarioRequest,
  EditarArticuloInventarioRequest
} from '../../../../services/articulos-inventario.service';

import {
  GrupoInventario,
  GruposInventarioService
} from '../../../../services/grupos-inventario.service';

type ModoRegistro = 'individual' | 'multiple';

interface ArticuloForm {
  codigo: string;
  nombre: string;
  modelo: string;
  puntoReorden: number | null;
  descripcion: string;
  grupoInventarioId: number | null;
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
export class RegistroArticuloComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private articulosService = inject(ArticulosInventarioService);
  private gruposService = inject(GruposInventarioService);

  editId: number | null = null;
  modo: ModoRegistro = 'individual';

  grupos: GrupoInventario[] = [];
  unidades: string[] = ['pz', 'lt', 'kg', 'm', 'jgo', 'caja'];

  form: ArticuloForm = this.getEmptyForm();
  rows: ArticuloRow[] = [this.getEmptyForm()];

  intentoGuardar = false;
  intentoGuardarMultiple = false;

  msg = '';
  errorMessage = '';
  loading = false;
  saving = false;

  ngOnInit(): void {
    this.cargarGrupos();

    const idParam = this.route.snapshot.paramMap.get('id');
    this.editId = idParam ? Number(idParam) : null;

    if (this.editId !== null && !Number.isNaN(this.editId)) {
      this.modo = 'individual';
      this.cargarArticulo(this.editId);
    } else {
      this.editId = null;
    }
  }

  setModo(m: ModoRegistro): void {
    if (this.editId !== null) return;

    this.msg = '';
    this.errorMessage = '';
    this.intentoGuardar = false;
    this.intentoGuardarMultiple = false;
    this.modo = m;
  }

  private getEmptyForm(): ArticuloForm {
    return {
      codigo: '',
      nombre: '',
      modelo: '',
      puntoReorden: null,
      descripcion: '',
      grupoInventarioId: null,
      unidad: '',
    };
  }

  private isValidArticulo(a: ArticuloForm): boolean {
    return !!a.codigo.trim() && !!a.nombre.trim() && !!a.grupoInventarioId && !!a.unidad;
  }

  private cargarGrupos(): void {
    this.gruposService.getGruposActivos().subscribe({
      next: (data) => {
        this.grupos = data ?? [];
      },
      error: (error) => {
        console.error('Error al cargar grupos:', error);
        this.errorMessage = error?.error?.mensaje || 'No se pudieron cargar los grupos.';
      }
    });
  }

  private cargarArticulo(id: number): void {
    this.loading = true;
    this.errorMessage = '';

    this.articulosService.getArticuloById(id).subscribe({
      next: (articulo) => {
        this.form = {
          codigo: articulo.codigo ?? '',
          nombre: articulo.nombre ?? '',
          modelo: articulo.modelo ?? '',
          puntoReorden: articulo.puntoReorden ?? null,
          descripcion: articulo.descripcion ?? '',
          grupoInventarioId: articulo.grupoInventarioId ?? null,
          unidad: articulo.unidad ?? '',
        };
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar artículo:', error);
        this.loading = false;

        if (error?.status === 404) {
          this.router.navigate(['/inventario']);
          return;
        }

        this.errorMessage = error?.error?.mensaje || 'No se pudo cargar el artículo.';
      }
    });
  }

  guardarIndividual(continuar: boolean): void {
    this.msg = '';
    this.errorMessage = '';
    this.intentoGuardar = true;

    if (!this.isValidArticulo(this.form)) {
      this.msg = 'Revisa los campos obligatorios.';
      return;
    }

    const payloadBase = {
      codigo: this.form.codigo.trim().toUpperCase(),
      nombre: this.form.nombre.trim(),
      modelo: this.form.modelo?.trim() || null,
      puntoReorden: this.form.puntoReorden,
      descripcion: this.form.descripcion?.trim() || null,
      unidad: this.form.unidad,
      grupoInventarioId: this.form.grupoInventarioId as number,
    };

    this.saving = true;

    if (this.editId !== null) {
      const payload: EditarArticuloInventarioRequest = {
        id: this.editId,
        ...payloadBase,
      };

      this.articulosService.editarArticulo(payload).subscribe({
        next: (response) => {
          this.saving = false;
          this.msg = response?.mensaje || 'Artículo actualizado correctamente.';
          this.router.navigate(['/inventario']);
        },
        error: (error) => {
          console.error('Error al actualizar artículo:', error);
          this.errorMessage = error?.error?.mensaje || 'No se pudo actualizar el artículo.';
          this.saving = false;
        }
      });

      return;
    }

    const payload: CrearArticuloInventarioRequest = payloadBase;

    this.articulosService.crearArticulo(payload).subscribe({
      next: (response) => {
        this.saving = false;
        this.msg = response?.mensaje || 'Artículo creado correctamente.';

        if (continuar) {
          this.form = this.getEmptyForm();
          this.intentoGuardar = false;
          return;
        }

        this.router.navigate(['/inventario']);
      },
      error: (error) => {
        console.error('Error al crear artículo:', error);
        this.errorMessage = error?.error?.mensaje || 'No se pudo crear el artículo.';
        this.saving = false;
      }
    });
  }

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
    this.errorMessage = '';
    this.intentoGuardarMultiple = true;

    const todasValidas = this.rows.every(r => this.isValidArticulo(r));
    if (!todasValidas) {
      this.msg = 'Hay filas incompletas. Completa los campos obligatorios en cada fila.';
      return;
    }

    const articulos = this.rows.map(r => ({
      codigo: r.codigo.trim().toUpperCase(),
      nombre: r.nombre.trim(),
      modelo: r.modelo?.trim() || null,
      puntoReorden: r.puntoReorden,
      descripcion: r.descripcion?.trim() || null,
      unidad: r.unidad,
      grupoInventarioId: r.grupoInventarioId as number,
    }));

    const payload: CrearArticuloInventarioMultipleRequest = {
      articulos
    };

    this.saving = true;

    this.articulosService.crearArticulosMultiples(payload).subscribe({
      next: (response) => {
        this.saving = false;
        this.msg = response?.mensaje || `Se guardaron ${this.rows.length} artículo(s) correctamente.`;
        this.rows = [this.getEmptyForm()];
        this.intentoGuardarMultiple = false;
      },
      error: (error) => {
        console.error('Error al guardar artículos múltiples:', error);
        this.errorMessage = error?.error?.mensaje || 'No se pudieron guardar los artículos.';
        this.saving = false;
      }
    });
  }

  onCancelar(): void {
    this.router.navigate(['/inventario']);
  }
}