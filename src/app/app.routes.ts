import { Routes } from '@angular/router';

import { authGuard } from './guards/auth.guard';

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
import { SolicitudesMantenimientoComponent } from './pages/mantenimientos/solicitudes-mantenimiento/solicitudes-mantenimiento';
import { RegistroSolicitudMantenimientoComponent } from './pages/mantenimientos/registro-solicitud-mantenimiento/registro-solicitud-mantenimiento';

import { RegistroUsuarioComponent } from './pages/usuarios/registro-usuario/registro-usuario';
import { RegistroVehiculoComponent } from './pages/vehiculos/registro-vehiculo/registro-vehiculo';
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

  // 🔓 LOGIN (SIN PROTECCIÓN)
  { path: '', component: LoginComponent },

  // 🔒 INICIO
  { path: 'inicio', component: InicioComponent, canActivate: [authGuard] },

  // 🔒 VEHÍCULOS
  { path: 'vehiculos', component: VehiculosComponent, canActivate: [authGuard] },
  { path: 'vehiculos/nuevo', component: RegistroVehiculoComponent, canActivate: [authGuard] },
  { path: 'vehiculos/:id/editar', component: RegistroVehiculoComponent, canActivate: [authGuard] },
  { path: 'vehiculos/tipos', component: TiposComponent, canActivate: [authGuard] },
  { path: 'vehiculos/tipos/nuevo', component: RegistroTipoComponent, canActivate: [authGuard] },
  { path: 'vehiculos/tipos/:id/editar', component: RegistroTipoComponent, canActivate: [authGuard] },
  { path: 'vehiculos/:id/documentos', component: VehiculoDocumentosComponent, canActivate: [authGuard] },
  { path: 'vehiculos/:id', component: VehiculoDetalleComponent, canActivate: [authGuard] },

  // 🔒 INVENTARIO
  { path: 'inventario', component: InventarioComponent, canActivate: [authGuard] },
  { path: 'inventario/nuevo', component: RegistroArticuloComponent, canActivate: [authGuard] },
  { path: 'inventario/:id/editar', component: RegistroArticuloComponent, canActivate: [authGuard] },
  { path: 'inventario/grupos', component: GruposComponent, canActivate: [authGuard] },
  { path: 'inventario/grupos/nuevo', component: RegistroGrupoComponent, canActivate: [authGuard] },
  { path: 'inventario/grupos/:id/editar', component: RegistroGrupoComponent, canActivate: [authGuard] },
  { path: 'inventario/entradas', component: EntradasComponent, canActivate: [authGuard] },
  { path: 'inventario/salidas', component: SalidasComponent, canActivate: [authGuard] },
  { path: 'inventario/historial-movimientos', component: HistorialMovimientosComponent, canActivate: [authGuard] },

  // 🔒 MANTENIMIENTOS
  { path: 'mantenimientos', component: MantenimientosComponent, canActivate: [authGuard] },
  { path: 'mantenimientos/registro', component: RegistroMantenimientoComponent, canActivate: [authGuard] },
  { path: 'mantenimientos/registro/:id/editar', component: RegistroMantenimientoComponent, canActivate: [authGuard] },
  { path: 'mantenimientos/recordatorios', component: RecordatoriosComponent, canActivate: [authGuard] },
  { path: 'mantenimientos/solicitudes', component: SolicitudesMantenimientoComponent, canActivate: [authGuard] },
  { path: 'mantenimientos/solicitudes/nueva', component: RegistroSolicitudMantenimientoComponent, canActivate: [authGuard] },

  // 🔒 USUARIOS
  { path: 'usuarios', component: UsuariosComponent, canActivate: [authGuard] },
  { path: 'usuarios/nuevo', component: RegistroUsuarioComponent, canActivate: [authGuard] },
  { path: 'usuarios/roles', component: RolesComponent, canActivate: [authGuard] },
  { path: 'usuarios/roles/nuevo', component: RegistroRolComponent, canActivate: [authGuard] },
  { path: 'usuarios/roles/:id/editar', component: RegistroRolComponent, canActivate: [authGuard] },
  { path: 'usuarios/:id/editar', component: RegistroUsuarioComponent, canActivate: [authGuard] },

  // 🔒 PROVEEDORES
  { path: 'proveedores', component: ProveedoresComponent, canActivate: [authGuard] },
  { path: 'proveedores/nuevo', component: RegistroProveedorComponent, canActivate: [authGuard] },
  { path: 'proveedores/:id/editar', component: RegistroProveedorComponent, canActivate: [authGuard] },

  // 🔁 REDIRECCIÓN
  { path: '**', redirectTo: '', pathMatch: 'full' },
];