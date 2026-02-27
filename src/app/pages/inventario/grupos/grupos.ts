import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { CabeceraComponent } from '../../../components/cabecera/cabecera';
import { FooterComponent } from '../../../components/footer/footer';

interface GrupoInventario {
  id: number;
  nombre: string;
}

const LS_KEY = 'robledo_inventario_grupos';

@Component({
  selector: 'app-grupos',
  standalone: true,
  imports: [CommonModule, RouterModule, CabeceraComponent, FooterComponent],
  templateUrl: './grupos.html',
  styleUrl: './grupos.scss',
})
export class GruposComponent implements OnInit {
  grupos: GrupoInventario[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.cargar();
    if (this.grupos.length === 0) {
      this.grupos = [{ id: 1, nombre: 'HERRAMIENTA' }];
      this.guardar();
    }
  }

  onAgregarGrupo(): void {
    this.router.navigate(['/inventario/grupos/nuevo']);
  }

  onActualizar(grupo: GrupoInventario): void {
    this.router.navigate(['/inventario/grupos', grupo.id, 'editar']);
  }

  onEliminar(grupo: GrupoInventario): void {
    const ok = confirm(`¿Eliminar el grupo "${grupo.nombre}"?`);
    if (!ok) return;

    this.grupos = this.grupos.filter(g => g.id !== grupo.id);
    this.guardar();
  }

  private cargar(): void {
    try {
      const raw = localStorage.getItem(LS_KEY);
      this.grupos = raw ? (JSON.parse(raw) as GrupoInventario[]) : [];
    } catch {
      this.grupos = [];
    }
  }

  private guardar(): void {
    localStorage.setItem(LS_KEY, JSON.stringify(this.grupos));
  }
}