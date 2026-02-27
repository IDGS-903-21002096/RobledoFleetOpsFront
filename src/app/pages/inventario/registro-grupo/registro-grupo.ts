import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { CabeceraComponent } from '../../../components/cabecera/cabecera';
import { FooterComponent } from '../../../components/footer/footer';

interface GrupoInventario {
  id: number;
  nombre: string;
}

const LS_KEY = 'robledo_inventario_grupos';

@Component({
  selector: 'app-registro-grupo',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CabeceraComponent, FooterComponent],
  templateUrl: './registro-grupo.html',
  styleUrl: './registro-grupo.scss',
})
export class RegistroGrupoComponent implements OnInit {
  editId: number | null = null;

  nombre = '';
  touchedNombre = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.editId = idParam ? Number(idParam) : null;

    if (this.editId !== null && !Number.isNaN(this.editId)) {
      const grupos = this.cargar();
      const found = grupos.find(g => g.id === this.editId);

      if (found) {
        this.nombre = found.nombre;
      } else {
        this.router.navigate(['/inventario/grupos']);
      }
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
    if (!this.nombreValido) return;

    const grupos = this.cargar();
    const nombreUpper = this.nombre.trim().toUpperCase();

    const duplicado = grupos.some(g =>
      g.nombre.toUpperCase() === nombreUpper && g.id !== this.editId
    );
    if (duplicado) {
      alert('Ese nombre de grupo ya existe.');
      return;
    }

    if (this.editId !== null) {
      const idx = grupos.findIndex(g => g.id === this.editId);
      if (idx >= 0) {
        grupos[idx] = { id: this.editId, nombre: nombreUpper };
      } else {
        alert('No se encontró el grupo a actualizar.');
        this.router.navigate(['/inventario/grupos']);
        return;
      }
    } else {
      const nextId = this.nextId(grupos);
      grupos.push({ id: nextId, nombre: nombreUpper });
    }

    this.guardar(grupos);
    this.router.navigate(['/inventario/grupos']);
  }

  private cargar(): GrupoInventario[] {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? (JSON.parse(raw) as GrupoInventario[]) : [];
    } catch {
      return [];
    }
  }

  private guardar(grupos: GrupoInventario[]): void {
    localStorage.setItem(LS_KEY, JSON.stringify(grupos));
  }

  private nextId(grupos: GrupoInventario[]): number {
    let max = 0;
    for (const g of grupos) if (g.id > max) max = g.id;
    return max + 1;
  }
}