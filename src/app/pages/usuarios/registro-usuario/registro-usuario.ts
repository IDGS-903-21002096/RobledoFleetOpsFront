import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { CabeceraComponent } from '../../../components/cabecera/cabecera';
import { FooterComponent } from '../../../components/footer/footer';
import { RolesService, Rol } from '../../../../services/roles.service';
import {
  UsuariosService,
  CrearUsuarioRequest,
  EditarUsuarioRequest,
  Usuario
} from '../../../../services/usuarios.service';

type AvatarOption = {
  key: string;
  url: string;
};

type RegistroUsuarioModel = {
  id: number | null;
  nombre: string;
  apellidos: string;
  email: string;
  rolId: number | null;
  password: string;
  avatarKey: string;
};

@Component({
  selector: 'app-registro-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CabeceraComponent, FooterComponent],
  templateUrl: './registro-usuario.html',
})
export class RegistroUsuarioComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private rolesService = inject(RolesService);
  private usuariosService = inject(UsuariosService);

  isEditMode = false;
  loading = false;
  saving = false;
  errorMessage = '';

  model: RegistroUsuarioModel = {
    id: null,
    nombre: '',
    apellidos: '',
    email: '',
    rolId: null,
    password: '',
    avatarKey: '',
  };

  roles: Rol[] = [];

  avatars: AvatarOption[] = [
    { key: 'av1', url: 'assets/avatars/av1.jpg' },
    { key: 'av2', url: 'assets/avatars/av2.png' },
  ];

  nombreTouched = false;
  apellidosTouched = false;
  emailTouched = false;
  rolTouched = false;
  avatarTouched = false;
  passwordTouched = false;

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!idParam;

    this.cargarPantalla(idParam ? Number(idParam) : null);
  }

  private cargarPantalla(usuarioId: number | null): void {
    this.loading = true;
    this.errorMessage = '';

    this.rolesService.getRoles().subscribe({
      next: (roles) => {
        this.roles = (roles ?? []).filter(r => r.activo);

        if (usuarioId) {
          this.cargarUsuario(usuarioId);
        } else {
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Error al cargar roles:', error);
        this.errorMessage = 'No se pudieron cargar los roles.';
        this.loading = false;
      }
    });
  }

  private cargarUsuario(id: number): void {
    this.usuariosService.getUsuarioById(id).subscribe({
      next: (usuario: Usuario) => {
        this.model = {
          id: usuario.id,
          nombre: usuario.nombre,
          apellidos: usuario.apellidos,
          email: usuario.email,
          rolId: usuario.rolId,
          password: '',
          avatarKey: usuario.avatarKey,
        };

        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar usuario:', error);
        this.errorMessage = error?.error?.mensaje || 'No se pudo cargar el usuario.';
        this.loading = false;
      }
    });
  }

  get selectedAvatarUrl(): string | null {
    const found = this.avatars.find((a) => a.key === this.model.avatarKey);
    return found ? found.url : null;
  }

  selectAvatar(a: AvatarOption): void {
    if (this.loading || this.saving) return;
    this.model.avatarKey = a.key;
    this.avatarTouched = true;
  }

  get selectedRolNombre(): string {
    const rol = this.roles.find(r => r.id === this.model.rolId);
    return rol?.nombre ?? '';
  }

  isValidNombre(v: string): boolean {
    return (v ?? '').trim().length > 0;
  }

  isValidApellidos(v: string): boolean {
    return (v ?? '').trim().length > 0;
  }

  isValidEmail(email: string): boolean {
    const value = (email ?? '').trim();
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(value);
  }

  isValidRol(v: number | null): boolean {
    return typeof v === 'number' && v > 0;
  }

  isValidAvatar(): boolean {
    return (this.model.avatarKey ?? '').trim().length > 0;
  }

  isValidPassword(v: string): boolean {
    const value = (v ?? '').trim();
    const minLen = value.length >= 8;
    const hasUpper = /[A-Z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    return minLen && hasUpper && hasNumber;
  }

  isPasswordSectionValid(): boolean {
  if (this.isEditMode) {
    if (!this.model.password?.trim()) return true;
    return this.isValidPassword(this.model.password);
  }

  return this.isValidPassword(this.model.password);
  }

  onCancelar(): void {
    if (this.saving) return;
    this.router.navigate(['/usuarios']);
  }

  onGuardar(): void {
    this.nombreTouched = true;
    this.apellidosTouched = true;
    this.emailTouched = true;
    this.rolTouched = true;
    this.avatarTouched = true;
    this.passwordTouched = true;
    this.errorMessage = '';

    const ok =
      this.isValidNombre(this.model.nombre) &&
      this.isValidApellidos(this.model.apellidos) &&
      this.isValidEmail(this.model.email) &&
      this.isValidRol(this.model.rolId) &&
      this.isValidAvatar() &&
      this.isPasswordSectionValid();

    if (!ok) return;

    this.saving = true;

    if (this.isEditMode) {
      const payload: EditarUsuarioRequest = {
        id: this.model.id!,
        nombre: this.model.nombre.trim(),
        apellidos: this.model.apellidos.trim(),
        email: this.model.email.trim(),
        avatarKey: this.model.avatarKey.trim(),
        rolId: this.model.rolId!,
        ...(this.model.password.trim() ? { password: this.model.password.trim() } : {})
      };

      this.usuariosService.editarUsuario(payload).subscribe({
        next: () => {
          this.saving = false;
          this.router.navigate(['/usuarios']);
        },
        error: (error) => {
          console.error('Error al actualizar usuario:', error);
          this.errorMessage = error?.error?.mensaje || 'No se pudo actualizar el usuario.';
          this.saving = false;
        }
      });

      return;
    }

    const payload: CrearUsuarioRequest = {
      nombre: this.model.nombre.trim(),
      apellidos: this.model.apellidos.trim(),
      email: this.model.email.trim(),
      password: this.model.password.trim(),
      avatarKey: this.model.avatarKey.trim(),
      rolId: this.model.rolId!,
    };

    this.usuariosService.crearUsuario(payload).subscribe({
      next: () => {
        this.saving = false;
        this.router.navigate(['/usuarios']);
      },
      error: (error) => {
        console.error('Error al crear usuario:', error);
        this.errorMessage = error?.error?.mensaje || 'No se pudo crear el usuario.';
        this.saving = false;
      }
    });
  }
}