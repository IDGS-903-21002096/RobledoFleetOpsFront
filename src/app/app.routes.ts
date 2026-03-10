import { Routes } from '@angular/router';

import { LoginComponent } from './pages/login/login';
import { InicioComponent } from './pages/inicio/inicio';

import { VehiculosComponent } from './pages/vehiculos/vehiculos';
import { UsuariosComponent } from './pages/usuarios/usuarios';
import { ProveedoresComponent } from './pages/proveedores/proveedores';
import { InventarioComponent } from './pages/inventario/inventario';
import { RolesComponent } from './pages/usuarios/roles/roles';
import { TiposComponent } from './pages/vehiculos/tipos/tipos';
import { GruposComponent } from './pages/inventario/grupos/grupos';
import { MantenimientosComponent } from './pages/mantenimientos/mantenimientos';

import { RegistroUsuarioComponent } from './pages/usuarios/registro-usuario/registro-usuario';
import { RegistroVehiculo } from './pages/vehiculos/registro-vehiculo/registro-vehiculo';
import { RegistroProveedorComponent } from './pages/proveedores/registro-proveedor/registro-proveedor';
import { RegistroArticuloComponent } from './pages/inventario/registro-articulo/registro-articulo';
import { EntradasComponent } from './pages/inventario/entradas/entradas';
import { SalidasComponent } from './pages/inventario/salidas/salidas';
import { HistorialMovimientosComponent } from './pages/inventario/historial-movimientos/historial-movimientos';
import { RegistroRolComponent } from './pages/usuarios/registro-rol/registro-rol';
import { RegistroTipoComponent } from './pages/vehiculos/registro-tipo/registro-tipo';
import { RegistroGrupoComponent } from './pages/inventario/registro-grupo/registro-grupo';
import { RegistroMantenimientoComponent } from './pages/mantenimientos/registro-mantenimiento/registro-mantenimiento';

import { VehiculoDetalleComponent } from './pages/vehiculos/vehiculo-detalle/vehiculo-detalle';
import { VehiculoDocumentosComponent } from './pages/vehiculos/vehiculo-documentos/vehiculo-documentos';
import { RecordatoriosComponent } from './pages/mantenimientos/recordatorios/recordatorios';

export const routes: Routes = [

  { path: '', component: LoginComponent },

  { path: 'inicio', component: InicioComponent },

  { path: 'vehiculos', component: VehiculosComponent },
  { path: 'vehiculos/nuevo', component: RegistroVehiculo },
  { path: 'vehiculos/:id/editar', component: RegistroVehiculo },
  { path: 'vehiculos/tipos', component: TiposComponent },
  { path: 'vehiculos/tipos/nuevo', component: RegistroTipoComponent },
  { path: 'vehiculos/tipos/:id/editar', component: RegistroTipoComponent },
  { path: 'vehiculos/:id/documentos', component: VehiculoDocumentosComponent },
  { path: 'vehiculos/:id', component: VehiculoDetalleComponent },

  { path: 'inventario', component: InventarioComponent },
  { path: 'inventario/nuevo', component: RegistroArticuloComponent },
  { path: 'inventario/:id/editar', component: RegistroArticuloComponent },
  { path: 'inventario/grupos', component: GruposComponent },
  { path: 'inventario/grupos/nuevo', component: RegistroGrupoComponent },
  { path: 'inventario/grupos/:id/editar', component: RegistroGrupoComponent },
  { path: 'inventario/entradas', component: EntradasComponent },
  { path: 'inventario/salidas', component: SalidasComponent },
  { path: 'inventario/historial-movimientos', component: HistorialMovimientosComponent },

  { path: 'mantenimientos', component: MantenimientosComponent },
  { path: 'mantenimientos/registro', component: RegistroMantenimientoComponent },
  { path: 'mantenimientos/recordatorios', component: RecordatoriosComponent },

  { path: 'usuarios', component: UsuariosComponent },
  { path: 'usuarios/nuevo', component: RegistroUsuarioComponent },
  { path: 'usuarios/roles', component: RolesComponent },
  { path: 'usuarios/roles/nuevo', component: RegistroRolComponent },
  { path: 'usuarios/roles/:id/editar', component: RegistroRolComponent },
  { path: 'usuarios/:id/editar', component: RegistroUsuarioComponent },

  { path: 'proveedores', component: ProveedoresComponent },
  { path: 'proveedores/nuevo', component: RegistroProveedorComponent },
  { path: 'proveedores/:id/editar', component: RegistroProveedorComponent },

  { path: '**', redirectTo: '', pathMatch: 'full' },
];
