import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VehiculosDocumentosService {

  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/VehiculosDocumentos`;

  getVencimientosDocumentos() {
    return this.http.get<any[]>(`${this.apiUrl}/vencimientos`);
  }
}