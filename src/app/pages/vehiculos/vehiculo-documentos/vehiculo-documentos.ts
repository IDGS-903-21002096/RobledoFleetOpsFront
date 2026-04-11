import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';

import { CabeceraComponent } from '../../../components/cabecera/cabecera';
import { FooterComponent } from '../../../components/footer/footer';
import { Vehiculo, VehiculosService } from '../../../../services/vehiculos.service';
import { environment } from '../../../../environments/environment';

type EstadoDoc = 'PENDIENTE' | 'SUBIENDO' | 'CARGADO';

type DocumentoItem = {
  idLocal: string;
  id?: number | null;
  nombre: string;
  tipo: string;
  archivo: File | null;
  archivoNombreActual?: string | null;
  notas: string;
  vencimientoPoliza: string;
  estado: EstadoDoc;
  progreso: number;
  dataUrl: string | null;
  mimeType: string | null;
  touchedNombre: boolean;
  touchedArchivo: boolean;
  touchedVencimientoPoliza: boolean;
  errorArchivo: string | null;
};

type HistorialDoc = {
  id: number;
  vehiculoId: number;
  nombre: string;
  tipo?: string;
  archivoNombre: string;
  mimeType: string;
  archivoUrl: string;
  notas?: string;
  fechaDocumento?: string;
  vencimientoPoliza?: string;
  activo: boolean;
};

type PreviewItem = {
  id: number;
  nombre: string;
  archivoNombre: string;
  archivoUrl: string;
  mimeType: string;
  safeUrl: SafeResourceUrl;
};

type CrearVehiculoDocumentoRequest = {
  vehiculoId: number;
  nombre: string;
  tipo?: string | null;
  archivoNombre: string;
  mimeType: string;
  archivoUrl: string;
  notas?: string | null;
  fechaDocumento: string;
  vencimientoPoliza?: string | null;
};

type EditarVehiculoDocumentoRequest = {
  id: number;
  vehiculoId: number;
  nombre: string;
  tipo?: string | null;
  archivoNombre: string;
  mimeType: string;
  archivoUrl: string;
  notas?: string | null;
  fechaDocumento: string;
  vencimientoPoliza?: string | null;
  activo: boolean;
};

@Component({
  selector: 'app-vehiculo-documentos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CabeceraComponent, FooterComponent],
  templateUrl: './vehiculo-documentos.html',
})
export class VehiculoDocumentosComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private sanitizer = inject(DomSanitizer);
  private http = inject(HttpClient);
  private vehiculosService = inject(VehiculosService);

  private apiUrl = `${environment.apiUrl}/VehiculosDocumentos`;

  vehiculoId: number | null = null;
  vehiculo: Vehiculo | null = null;

  loadingVehiculo = false;
  loadingHistorial = false;
  saving = false;
  errorMessage = '';

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

  historial: HistorialDoc[] = [];

  previewOpen = false;
  previewDoc: PreviewItem | null = null;

  modoEdicion = false;
  documentoEditandoId: number | null = null;

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const parsed = idParam ? Number(idParam) : null;
    this.vehiculoId = parsed && !Number.isNaN(parsed) ? parsed : null;

    if (!this.vehiculoId) {
      this.errorMessage = 'No se recibió un ID de vehículo válido.';
      return;
    }

    this.cargarVehiculo();
    this.cargarHistorial();
  }

  private cargarVehiculo(): void {
    if (!this.vehiculoId) return;

    this.loadingVehiculo = true;
    this.vehiculosService.getVehiculoById(this.vehiculoId).subscribe({
      next: (data) => {
        this.vehiculo = data;
        this.loadingVehiculo = false;
      },
      error: (error) => {
        console.error('Error al cargar vehículo:', error);
        this.errorMessage = error?.error?.mensaje || 'No se pudo cargar la información del vehículo.';
        this.loadingVehiculo = false;
      }
    });
  }

  private cargarHistorial(): void {
    if (!this.vehiculoId) return;

    this.loadingHistorial = true;

    this.http.get<HistorialDoc[]>(`${this.apiUrl}/vehiculo/${this.vehiculoId}`).subscribe({
      next: (data) => {
        this.historial = data ?? [];
        this.loadingHistorial = false;
      },
      error: (error) => {
        console.error('Error al cargar historial de documentos:', error);
        this.errorMessage = error?.error?.mensaje || 'No se pudo cargar el historial de documentos.';
        this.loadingHistorial = false;
      }
    });
  }

  addDocumento(): void {
    if (this.modoEdicion) {
      this.resetFormulario();
    }

    const newItem: DocumentoItem = {
      idLocal: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
      id: null,
      nombre: '',
      tipo: '',
      archivo: null,
      archivoNombreActual: null,
      notas: '',
      vencimientoPoliza: '',
      estado: 'PENDIENTE',
      progreso: 0,
      dataUrl: null,
      mimeType: null,
      touchedNombre: false,
      touchedArchivo: false,
      touchedVencimientoPoliza: false,
      errorArchivo: null,
    };

    this.documentos = [...this.documentos, newItem];
  }

  removeDocumento(index: number): void {
    this.documentos = this.documentos.filter((_, i) => i !== index);

    if (this.documentos.length === 0 && this.modoEdicion) {
      this.resetFormulario();
    }
  }

  editarHistorial(h: HistorialDoc): void {
    this.modoEdicion = true;
    this.documentoEditandoId = h.id;
    this.submitAttempted = false;
    this.errorMessage = '';

    this.documentos = [
      {
        idLocal: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
        id: h.id,
        nombre: h.nombre,
        tipo: h.tipo || '',
        archivo: null,
        archivoNombreActual: h.archivoNombre || null,
        notas: h.notas || '',
        vencimientoPoliza: h.vencimientoPoliza ? this.toDateInputValue(h.vencimientoPoliza) : '',
        estado: 'CARGADO',
        progreso: 100,
        dataUrl: h.archivoUrl,
        mimeType: h.mimeType,
        touchedNombre: false,
        touchedArchivo: false,
        touchedVencimientoPoliza: false,
        errorArchivo: null,
      }
    ];

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  isTipoPoliza(tipo: string): boolean {
    return tipo === 'Póliza de seguro';
  }

  isValidVencimientoPoliza(value: string): boolean {
    if (!value) return false;
    const fecha = new Date(value);
    return !Number.isNaN(fecha.getTime());
  }

  async onFileChange(event: Event, doc: DocumentoItem): Promise<void> {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0] ?? null;

    doc.archivo = file;
    doc.touchedArchivo = true;
    doc.errorArchivo = null;

    if (!file) {
      if (!doc.dataUrl || !doc.mimeType) {
        doc.estado = 'PENDIENTE';
        doc.progreso = 0;
      }
      return;
    }

    const isPdf = file.type === 'application/pdf';
    const isImage = file.type.startsWith('image/');
    if (!isPdf && !isImage) {
      doc.errorArchivo = 'Solo se permiten archivos PDF o imágenes (JPG/PNG/WEBP).';
      doc.archivo = null;
      if (!doc.dataUrl || !doc.mimeType) {
        doc.estado = 'PENDIENTE';
        doc.progreso = 0;
      }
      return;
    }

    try {
      const dataUrl = await this.fileToDataUrl(file);
      doc.dataUrl = dataUrl;
      doc.mimeType = file.type;
      doc.archivoNombreActual = file.name;
      this.simularSubida(doc);
    } catch {
      doc.errorArchivo = 'No se pudo leer el archivo. Intenta de nuevo.';
      doc.archivo = null;
      if (!doc.dataUrl || !doc.mimeType) {
        doc.dataUrl = null;
        doc.mimeType = null;
        doc.estado = 'PENDIENTE';
        doc.progreso = 0;
      }
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

  isPdfMime(mimeType: string): boolean {
    return mimeType === 'application/pdf';
  }

  openPreviewHist(h: HistorialDoc): void {
    if (!h.archivoUrl || !h.mimeType) return;

    const safe = this.sanitizer.bypassSecurityTrustResourceUrl(h.archivoUrl);

    this.previewDoc = {
      id: h.id,
      nombre: h.nombre,
      archivoNombre: h.archivoNombre,
      archivoUrl: h.archivoUrl,
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
    if (!h.archivoUrl) return;

    const a = document.createElement('a');
    a.href = h.archivoUrl;
    a.download = h.archivoNombre || `${(h.nombre || 'documento').trim()}.bin`;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  downloadPreview(): void {
    if (!this.previewDoc) return;

    const a = document.createElement('a');
    a.href = this.previewDoc.archivoUrl;
    a.download = this.previewDoc.archivoNombre || `${(this.previewDoc.nombre || 'documento').trim()}.bin`;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  removeHistorial(h: HistorialDoc): void {
    const ok = confirm(`¿Eliminar el documento "${h.nombre}"?`);
    if (!ok) return;

    this.http.delete(`${this.apiUrl}/${h.id}`).subscribe({
      next: () => {
        if (this.previewDoc?.id === h.id) {
          this.closePreview();
        }

        if (this.documentoEditandoId === h.id) {
          this.resetFormulario();
        }

        this.cargarHistorial();
      },
      error: (error) => {
        console.error('Error al eliminar documento:', error);
        alert(error?.error?.mensaje || 'No se pudo eliminar el documento.');
      }
    });
  }

  isValidNombreDoc(v: string): boolean {
    return (v ?? '').trim().length >= 2;
  }

  isValidArchivo(d: DocumentoItem): boolean {
    return !d.errorArchivo && !!d.dataUrl && !!d.mimeType;
  }

  isValidItem(d: DocumentoItem): boolean {
    const nombreValido = this.isValidNombreDoc(d.nombre);
    const archivoValido = this.isValidArchivo(d);
    const vencimientoValido = this.isTipoPoliza(d.tipo)
      ? this.isValidVencimientoPoliza(d.vencimientoPoliza)
      : true;

    return nombreValido && archivoValido && vencimientoValido;
  }

  isValidForm(): boolean {
    if (this.documentos.length === 0) return false;
    return this.documentos.every((d) => this.isValidItem(d));
  }

  onRegresar(): void {
    if (this.vehiculoId) {
      this.router.navigate(['/vehiculos', this.vehiculoId]);
      return;
    }

    this.router.navigate(['/vehiculos']);
  }

  onCancelarFormulario(): void {
    this.resetFormulario();
  }

  onGuardar(): void {
    this.submitAttempted = true;
    this.errorMessage = '';

    this.documentos = this.documentos.map((d) => ({
      ...d,
      touchedNombre: true,
      touchedArchivo: true,
      touchedVencimientoPoliza: this.isTipoPoliza(d.tipo) ? true : d.touchedVencimientoPoliza,
    }));

    if (!this.isValidForm() || !this.vehiculoId) return;

    this.saving = true;

    if (this.modoEdicion) {
      const d = this.documentos[0];

      if (!this.documentoEditandoId) {
        this.errorMessage = 'No se identificó el documento a editar.';
        this.saving = false;
        return;
      }

      const payload: EditarVehiculoDocumentoRequest = {
        id: this.documentoEditandoId,
        vehiculoId: this.vehiculoId,
        nombre: d.nombre.trim(),
        tipo: d.tipo?.trim() ? d.tipo.trim() : null,
        archivoNombre: (d.archivo?.name || d.archivoNombreActual || 'documento').trim(),
        mimeType: d.mimeType || '',
        archivoUrl: d.dataUrl || '',
        notas: d.notas?.trim() ? d.notas.trim() : null,
        fechaDocumento: new Date().toISOString(),
        vencimientoPoliza: this.isTipoPoliza(d.tipo) ? d.vencimientoPoliza : null,
        activo: true,
      };

      this.http.put(`${this.apiUrl}`, payload).subscribe({
        next: () => {
          this.resetFormulario();
          this.cargarHistorial();
        },
        error: (error) => {
          console.error('Error al actualizar documento:', error);
          this.errorMessage = error?.error?.mensaje || 'No se pudo actualizar el documento.';
          this.saving = false;
        }
      });

      return;
    }

    const payload: CrearVehiculoDocumentoRequest[] = this.documentos.map((d) => ({
      vehiculoId: this.vehiculoId!,
      nombre: d.nombre.trim(),
      tipo: d.tipo?.trim() ? d.tipo.trim() : null,
      archivoNombre: (d.archivo?.name || d.archivoNombreActual || 'documento').trim(),
      mimeType: d.mimeType || '',
      archivoUrl: d.dataUrl || '',
      notas: d.notas?.trim() ? d.notas.trim() : null,
      fechaDocumento: new Date().toISOString(),
      vencimientoPoliza: this.isTipoPoliza(d.tipo) ? d.vencimientoPoliza : null,
    }));

    this.http.post(`${this.apiUrl}/multiple`, payload).subscribe({
      next: () => {
        this.resetFormulario();
        this.cargarHistorial();
      },
      error: (error) => {
        console.error('Error al guardar documentos:', error);
        this.errorMessage = error?.error?.mensaje || 'No se pudieron guardar los documentos.';
        this.saving = false;
      }
    });
  }

  private resetFormulario(): void {
    this.saving = false;
    this.documentos = [];
    this.submitAttempted = false;
    this.modoEdicion = false;
    this.documentoEditandoId = null;
    this.errorMessage = '';
  }

  private toDateInputValue(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}