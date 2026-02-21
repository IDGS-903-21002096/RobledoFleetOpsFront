import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { CabeceraComponent } from '../../../components/cabecera/cabecera';
import { FooterComponent } from '../../../components/footer/footer';

type EstadoDoc = 'PENDIENTE' | 'SUBIENDO' | 'CARGADO';

type DocumentoItem = {
  idLocal: string;
  nombre: string;
  tipo: string;
  archivo: File | null;
  notas: string;

  estado: EstadoDoc;
  progreso: number;

  // Guardado local (base64 DataURL)
  dataUrl: string | null;
  mimeType: string | null;

  // Validaciones / UI
  touchedNombre: boolean;
  touchedArchivo: boolean;
  errorArchivo: string | null;
};

type HistorialDoc = {
  idLocal: string; // <-- para eliminar de forma segura
  nombre: string;
  tipo?: string;
  archivoNombre: string;
  fecha: string;

  // Para preview/descarga en tabla
  dataUrl: string;
  mimeType: string;
};

type PreviewItem = {
  nombre: string;
  archivoNombre: string;
  dataUrl: string;
  mimeType: string;
  safeUrl: SafeResourceUrl; // para iframe pdf
};

@Component({
  selector: 'app-vehiculo-documentos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CabeceraComponent, FooterComponent],
  templateUrl: './vehiculo-documentos.html',
})
export class VehiculoDocumentosComponent {
  vehiculoId: number | null = null;

  tiposDoc: string[] = [
    'Tarjeta de circulación',
    'Póliza de seguro',
    'Verificación',
    'Permiso',
    'Factura',
    'Otro',
  ];

  documentos: DocumentoItem[] = [];
  submitAttempted = false;

  // Historial (ya cargados)
  historial: HistorialDoc[] = [];

  // Modal preview
  previewOpen = false;
  previewDoc: PreviewItem | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer
  ) {
    const idParam = this.route.snapshot.paramMap.get('id');
    const parsed = idParam ? Number(idParam) : null;
    this.vehiculoId = parsed && !Number.isNaN(parsed) ? parsed : null;
  }

  // =========================
  // UI helpers
  // =========================
  addDocumento(): void {
    const newItem: DocumentoItem = {
      idLocal: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
      nombre: '',
      tipo: '',
      archivo: null,
      notas: '',
      estado: 'PENDIENTE',
      progreso: 0,

      dataUrl: null,
      mimeType: null,

      touchedNombre: false,
      touchedArchivo: false,
      errorArchivo: null,
    };

    this.documentos = [...this.documentos, newItem];
  }

  removeDocumento(index: number): void {
    this.documentos = this.documentos.filter((_, i) => i !== index);
  }

  // =========================
  // Archivos: solo PDF o Imagen, guardando base64
  // =========================
  async onFileChange(event: Event, doc: DocumentoItem): Promise<void> {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0] ?? null;

    doc.archivo = file;
    doc.touchedArchivo = true;

    // reset
    doc.errorArchivo = null;
    doc.dataUrl = null;
    doc.mimeType = null;

    if (!file) {
      doc.estado = 'PENDIENTE';
      doc.progreso = 0;
      return;
    }

    const isPdf = file.type === 'application/pdf';
    const isImage = file.type.startsWith('image/');
    if (!isPdf && !isImage) {
      doc.errorArchivo = 'Solo se permiten archivos PDF o imágenes (JPG/PNG/WEBP).';
      doc.archivo = null;
      doc.estado = 'PENDIENTE';
      doc.progreso = 0;
      return;
    }

    try {
      const dataUrl = await this.fileToDataUrl(file);
      doc.dataUrl = dataUrl;
      doc.mimeType = file.type;

      this.simularSubida(doc);
    } catch {
      doc.errorArchivo = 'No se pudo leer el archivo. Intenta de nuevo.';
      doc.archivo = null;
      doc.dataUrl = null;
      doc.mimeType = null;
      doc.estado = 'PENDIENTE';
      doc.progreso = 0;
    }
  }

  private fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('read_error'));
      reader.onload = () => resolve(String(reader.result));
      reader.readAsDataURL(file);
    });
  }

  private simularSubida(doc: DocumentoItem): void {
    doc.estado = 'SUBIENDO';
    doc.progreso = 0;

    const steps = [15, 35, 60, 85, 100];
    let i = 0;

    const tick = () => {
      doc.progreso = steps[i];
      i++;

      if (doc.progreso >= 100) {
        doc.estado = 'CARGADO';
        doc.progreso = 100;
        return;
      }
      setTimeout(tick, 180);
    };

    setTimeout(tick, 120);
  }

  // =========================
  // Preview helpers
  // =========================
  isPdfMime(mimeType: string): boolean {
    return mimeType === 'application/pdf';
  }

  openPreviewHist(h: HistorialDoc): void {
    if (!h.dataUrl || !h.mimeType) return;

    const safe = this.sanitizer.bypassSecurityTrustResourceUrl(h.dataUrl);

    this.previewDoc = {
      nombre: h.nombre,
      archivoNombre: h.archivoNombre,
      dataUrl: h.dataUrl,
      mimeType: h.mimeType,
      safeUrl: safe,
    };
    this.previewOpen = true;
  }

  closePreview(): void {
    this.previewOpen = false;
    this.previewDoc = null;
  }

  downloadHist(h: HistorialDoc): void {
    if (!h.dataUrl) return;

    const a = document.createElement('a');
    a.href = h.dataUrl;
    a.download = h.archivoNombre || `${(h.nombre || 'documento').trim()}.bin`;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  downloadPreview(): void {
    if (!this.previewDoc) return;

    const a = document.createElement('a');
    a.href = this.previewDoc.dataUrl;
    a.download =
      this.previewDoc.archivoNombre || `${(this.previewDoc.nombre || 'documento').trim()}.bin`;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  // =========================
  // Eliminar (historial)
  // =========================
  removeHistorial(h: HistorialDoc): void {
    const ok = confirm(`¿Eliminar el documento "${h.nombre}" del historial?`);
    if (!ok) return;

    // si está abierto en preview, ciérralo
    if (this.previewDoc?.archivoNombre === h.archivoNombre && this.previewDoc?.nombre === h.nombre) {
      this.closePreview();
    }

    this.historial = this.historial.filter((x) => x.idLocal !== h.idLocal);
  }

  // =========================
  // Validaciones
  // =========================
  isValidNombreDoc(v: string): boolean {
    return (v ?? '').trim().length >= 2;
  }

  isValidArchivo(d: DocumentoItem): boolean {
    return !!d.archivo && !d.errorArchivo && !!d.dataUrl && !!d.mimeType;
  }

  isValidItem(d: DocumentoItem): boolean {
    return this.isValidNombreDoc(d.nombre) && this.isValidArchivo(d);
  }

  isValidForm(): boolean {
    if (this.documentos.length === 0) return false;
    return this.documentos.every((d) => this.isValidItem(d));
  }

  // =========================
  // Acciones
  // =========================
  onRegresar(): void {
    if (this.vehiculoId) {
      this.router.navigate(['/vehiculos', this.vehiculoId]);
      return;
    }
    this.router.navigate(['/vehiculos']);
  }

  onGuardar(): void {
    this.submitAttempted = true;

    this.documentos = this.documentos.map((d) => ({
      ...d,
      touchedNombre: true,
      touchedArchivo: true,
    }));

    if (!this.isValidForm()) return;

    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${dd}`;

    const nuevos: HistorialDoc[] = this.documentos.map((d) => ({
      idLocal: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
      nombre: d.nombre.trim(),
      tipo: d.tipo || undefined,
      archivoNombre: d.archivo?.name ?? '—',
      fecha: dateStr,
      dataUrl: d.dataUrl ?? '',
      mimeType: d.mimeType ?? '',
    }));

    this.historial = [...nuevos, ...this.historial];

    this.documentos = [];
    this.submitAttempted = false;
  }
}
