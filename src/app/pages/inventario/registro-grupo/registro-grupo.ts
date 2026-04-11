import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { CabeceraComponent } from '../../../components/cabecera/cabecera';
import { FooterComponent } from '../../../components/footer/footer';
import {
  GruposInventarioService
} from '../../../../services/grupos-inventario.service';

@Component({
  selector: 'app-registro-grupo',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CabeceraComponent, FooterComponent],
  templateUrl: './registro-grupo.html',
  styleUrl: './registro-grupo.scss',
})
export class RegistroGrupoComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private gruposInventarioService = inject(GruposInventarioService);

  editId: number | null = null;

  nombre = '';
  touchedNombre = false;

  loading = false;
  saving = false;
  errorMessage = '';

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.editId = idParam ? Number(idParam) : null;

    if (this.editId !== null && !Number.isNaN(this.editId)) {
      this.cargarGrupo(this.editId);
    } else {
      this.editId = null;
    }
  }

  get nombreValido(): boolean {
    return this.nombre.trim().length >= 3;
  }

  onCancelar(): void {
    this.router.navigate(['/inventario/grupos']);
  }

  onGuardar(): void {
    this.touchedNombre = true;
    this.errorMessage = '';

    if (!this.nombreValido || this.saving) return;

    const payloadNombre = this.nombre.trim().toUpperCase();

    this.saving = true;

    if (this.editId !== null) {
      this.gruposInventarioService.editarGrupo({
        id: this.editId,
        nombre: payloadNombre
      }).subscribe({
        next: () => {
          this.saving = false;
          this.router.navigate(['/inventario/grupos']);
        },
        error: (error) => {
          console.error('Error al actualizar grupo:', error);
          this.errorMessage = error?.error?.mensaje || 'No se pudo actualizar el grupo.';
          this.saving = false;
        }
      });
    } else {
      this.gruposInventarioService.crearGrupo({
        nombre: payloadNombre
      }).subscribe({
        next: () => {
          this.saving = false;
          this.router.navigate(['/inventario/grupos']);
        },
        error: (error) => {
          console.error('Error al crear grupo:', error);
          this.errorMessage = error?.error?.mensaje || 'No se pudo crear el grupo.';
          this.saving = false;
        }
      });
    }
  }

  private cargarGrupo(id: number): void {
    this.loading = true;
    this.errorMessage = '';

    this.gruposInventarioService.getGrupoById(id).subscribe({
      next: (grupo) => {
        this.nombre = grupo.nombre ?? '';
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar grupo:', error);
        this.loading = false;

        if (error?.status === 404) {
          this.router.navigate(['/inventario/grupos']);
          return;
        }

        this.errorMessage = error?.error?.mensaje || 'No se pudo cargar la información del grupo.';
      }
    });
  }
}