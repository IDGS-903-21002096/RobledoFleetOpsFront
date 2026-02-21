import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { CabeceraComponent } from '../../components/cabecera/cabecera';
import { FooterComponent } from '../../components/footer/footer';

type Unidad = 'pz' | 'lt' | 'kg' | 'm' | 'jgo';

interface InventarioItem {
  codigo: string;
  nombre: string;
  descripcion?: string;
  grupo: string;
  existencia: number;
  unidad: Unidad;
  minimo?: number; // para badge "Stock bajo"
  costoPromedio: number;
  activo: boolean;
}

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule, CabeceraComponent, FooterComponent],
  templateUrl: './inventario.html',
  styleUrl: './inventario.scss',
})
export class InventarioComponent {
  // =========================
  // Mock KPIs (inspirados en la referencia)
  // =========================
  kpiEntradas = 207_758.97;
  kpiSalidas = 10_684.37;

  // =========================
  // Data mock
  // =========================
  items: InventarioItem[] = [
    {
      codigo: 'G141',
      nombre: 'Disco de lija 6" X 6 G100',
      descripcion: '',
      grupo: 'HERRAMIENTA',
      existencia: 0,
      unidad: 'pz',
      minimo: 5,
      costoPromedio: 0,
      activo: true,
    },
    {
      codigo: 'H001',
      nombre: 'Pistola de Pintura',
      descripcion: 'Pistola de pintura funcional completa.',
      grupo: 'HERRAMIENTA',
      existencia: 2,
      unidad: 'pz',
      minimo: 1,
      costoPromedio: 1250,
      activo: true,
    },
    {
      codigo: 'L020',
      nombre: 'Aceite 15W-40',
      descripcion: 'Aceite para motor diésel (galón).',
      grupo: 'LUBRICANTE',
      existencia: 18,
      unidad: 'lt',
      minimo: 10,
      costoPromedio: 98.5,
      activo: true,
    },
    {
      codigo: 'R310',
      nombre: 'Filtro de aire',
      descripcion: 'Filtro de aire para autobús.',
      grupo: 'REFACCIÓN',
      existencia: 3,
      unidad: 'pz',
      minimo: 6,
      costoPromedio: 420,
      activo: true,
    },
    {
      codigo: 'S777',
      nombre: 'Sellador silicón',
      descripcion: 'Sellador para juntas y carrocería.',
      grupo: 'CONSUMIBLE',
      existencia: 12,
      unidad: 'pz',
      minimo: 8,
      costoPromedio: 55,
      activo: false,
    },
  ];

  // =========================
  // Filtros
  // =========================
  busqueda = '';
  filtroGrupo = '';
  grupos: string[] = [];

  // =========================
  // Paginación
  // =========================
  page = 1;
  pageSize = 10;

  // Derivados
  itemsFiltrados: InventarioItem[] = [];
  itemsPaginados: InventarioItem[] = [];

  constructor(private router: Router) {
    this.grupos = Array.from(new Set(this.items.map(x => x.grupo))).sort();
    this.aplicarFiltros();
  }

  // KPI derivado: valor inventario actual (existencia * costoPromedio)
  get kpiValorInventario(): number {
    return this.itemsFiltrados.reduce((acc, it) => acc + it.existencia * it.costoPromedio, 0);
  }

  // Rangos
  get totalPages(): number {
    const total = this.itemsFiltrados.length;
    return Math.max(1, Math.ceil(total / this.pageSize));
  }

  get inicioRango(): number {
    const total = this.itemsFiltrados.length;
    if (total === 0) return 0;
    return (this.page - 1) * this.pageSize + 1;
  }

  get finRango(): number {
    const total = this.itemsFiltrados.length;
    if (total === 0) return 0;
    return Math.min(this.page * this.pageSize, total);
  }

  // Helper seguro para convertir a texto
  private toText(v: unknown): string {
    return v === null || v === undefined ? '' : String(v).toLowerCase();
  }

  aplicarFiltros(): void {
    const q = (this.busqueda || '').trim().toLowerCase();
    const g = (this.filtroGrupo || '').trim().toLowerCase();

    this.itemsFiltrados = this.items.filter(it => {
      // Filtro por grupo (si se seleccionó)
      const matchGrupo = !g || this.toText(it.grupo) === g;

      // Búsqueda global por cualquier campo relevante (como en los otros módulos)
      const matchQuery =
        !q ||
        [
          it.codigo,
          it.nombre,
          it.descripcion ?? '',
          it.grupo,
          it.unidad,
          it.existencia,
          it.minimo ?? '',
          it.costoPromedio,
          this.estatusTexto(it),          // "Activo / Inactivo / Stock bajo / Sin stock"
          it.activo ? 'activo' : 'inactivo',
        ]
          .map(v => this.toText(v))
          .some(txt => txt.includes(q));

      return matchGrupo && matchQuery;
    });

    // Ajustar página si se sale del rango
    this.page = Math.min(this.page, this.totalPages);
    this.page = Math.max(1, this.page);

    this.refrescarPaginado();
  }

  refrescarPaginado(): void {
    const start = (this.page - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.itemsPaginados = this.itemsFiltrados.slice(start, end);
  }

  cambiarPageSize(): void {
    this.page = 1;
    this.refrescarPaginado();
  }

  prevPage(): void {
    if (this.page <= 1) return;
    this.page -= 1;
    this.refrescarPaginado();
  }

  nextPage(): void {
    if (this.page >= this.totalPages) return;
    this.page += 1;
    this.refrescarPaginado();
  }

  // =========================
  // UI Helpers (badges)
  // =========================
  estatusTexto(it: InventarioItem): string {
    if (!it.activo) return 'Inactivo';
    const min = it.minimo ?? 0;
    if (min > 0 && it.existencia <= 0) return 'Sin stock';
    if (min > 0 && it.existencia < min) return 'Stock bajo';
    return 'Activo';
  }

  badgeClass(it: InventarioItem): string {
    const est = this.estatusTexto(it);
    switch (est) {
      case 'Activo':
        return 'bg-emerald-100 text-emerald-700';
      case 'Stock bajo':
        return 'bg-amber-100 text-amber-700';
      case 'Sin stock':
        return 'bg-rose-100 text-rose-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  }

  trackByCodigo(_: number, it: InventarioItem): string {
    return it.codigo;
  }

  // =========================
  // Acciones (mock)
  // =========================
  onRegistrarArticulo(): void {
    this.router.navigate(['/inventario/nuevo']);
  }

  // Ya no lo usamos (lo puedes borrar si quieres)
  onExportarCsv(): void {
    alert('Exportar CSV (solo UI por ahora).');
  }

  onEditar(it: InventarioItem): void {
    // mock: usamos el código como :id
    this.router.navigate(['/inventario', it.codigo, 'editar']);
  }

  onEliminar(it: InventarioItem): void {
    const ok = confirm(`¿Eliminar el artículo ${it.codigo} - ${it.nombre}?`);
    if (!ok) return;

    // Mock delete en front
    this.items = this.items.filter(x => x.codigo !== it.codigo);
    this.grupos = Array.from(new Set(this.items.map(x => x.grupo))).sort();
    this.aplicarFiltros();
  }
}