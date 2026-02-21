import { Routes } from '@angular/router';

import { LoginComponent } from './pages/login/login';
import { InicioComponent } from './pages/inicio/inicio';

import { VehiculosComponent } from './pages/vehiculos/vehiculos';
import { UsuariosComponent } from './pages/usuarios/usuarios';
import { ProveedoresComponent } from './pages/proveedores/proveedores';
import { InventarioComponent } from './pages/inventario/inventario';

import { RegistroUsuarioComponent } from './pages/usuarios/registro-usuario/registro-usuario';
import { RegistroVehiculo } from './pages/vehiculos/registro-vehiculo/registro-vehiculo';
import { RegistroProveedorComponent } from './pages/proveedores/registro-proveedor/registro-proveedor';
import { RegistroArticuloComponent } from './pages/inventario/registro-articulo/registro-articulo';

import { VehiculoDetalleComponent } from './pages/vehiculos/vehiculo-detalle/vehiculo-detalle';
import { VehiculoDocumentosComponent } from './pages/vehiculos/vehiculo-documentos/vehiculo-documentos';

export const routes: Routes = [

  { path: '', component: LoginComponent },

  { path: 'inicio', component: InicioComponent },

  { path: 'vehiculos', component: VehiculosComponent },
  { path: 'vehiculos/nuevo', component: RegistroVehiculo },
  { path: 'vehiculos/:id/editar', component: RegistroVehiculo },
  { path: 'vehiculos/:id/documentos', component: VehiculoDocumentosComponent },
  { path: 'vehiculos/:id', component: VehiculoDetalleComponent },

  { path: 'inventario', component: InventarioComponent },
  { path: 'inventario/nuevo', component: RegistroArticuloComponent },
  { path: 'inventario/:id/editar', component: RegistroArticuloComponent },

  { path: 'usuarios', component: UsuariosComponent },
  { path: 'usuarios/nuevo', component: RegistroUsuarioComponent },
  { path: 'usuarios/:id/editar', component: RegistroUsuarioComponent },

  { path: 'proveedores', component: ProveedoresComponent },
  { path: 'proveedores/nuevo', component: RegistroProveedorComponent },
  { path: 'proveedores/:id/editar', component: RegistroProveedorComponent },

  { path: '**', redirectTo: '', pathMatch: 'full' },
];
