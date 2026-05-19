import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, inject } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService, UsuarioAutenticado } from '../../../services/auth.service';
import { LayoutService } from '../../../services/layout.service';

type MenuSection = 'vehiculos' | 'inventario' | 'mantenimientos' | 'usuarios' | null;

@Component({
  selector: 'app-cabecera',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cabecera.html',
  styleUrl: './cabecera.scss',
})
export class CabeceraComponent implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  private layoutService = inject(LayoutService);

  mobileMenuOpen = false;
  userMenuOpen = false;
  sidebarCollapsed = false;

  vehiculosOpen = false;
  inventarioOpen = false;
  mantenimientosOpen = false;
  usuariosOpen = false;

  hoveredCollapsedSection: MenuSection = null;
  collapsedPanelStyle: Record<string, string> = {};

  private hoverCloseTimeout: ReturnType<typeof setTimeout> | null = null;

  usuario: UsuarioAutenticado | null = this.authService.getUsuario();

  ngOnInit(): void {
    this.layoutService.loadSidebarState();
    this.sidebarCollapsed = this.layoutService.sidebarCollapsed;

    this.syncMenuWithRoute();

    this.layoutService.sidebarCollapsed$.subscribe((collapsed) => {
      this.sidebarCollapsed = collapsed;

      if (!collapsed) {
        this.hoveredCollapsedSection = null;
        this.collapsedPanelStyle = {};
      }
    });

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.usuario = this.authService.getUsuario();
        this.syncMenuWithRoute();
        this.closeMobileMenu();
        this.closeUserMenu();
        this.closeCollapsedHoverImmediately();
      });
  }

  get nombreUsuario(): string {
    if (!this.usuario) return 'Usuario';
    return `${this.usuario.nombre} ${this.usuario.apellidos}`.trim();
  }

  get emailUsuario(): string {
    return this.usuario?.email ?? 'usuario@robledo.com';
  }

  get avatarUsuario(): string {
    const avatarKey = this.usuario?.avatarKey?.trim()?.toLowerCase();

    switch (avatarKey) {
      case 'av1':
        return 'assets/avatars/av1.jpg';
      case 'av2':
        return 'assets/avatars/av2.png';
      default:
        return 'assets/avatars/av2.png';
    }
  }

  get sidebarWidthClass(): string {
    return this.sidebarCollapsed ? 'md:w-20' : 'md:w-72';
  }

  onAvatarError(event: Event): void {
    const img = event.target as HTMLImageElement;

    if (img.dataset['fallbackApplied'] === 'true') return;

    img.dataset['fallbackApplied'] = 'true';
    img.src = 'assets/avatars/av2.png';
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    if (this.mobileMenuOpen) this.userMenuOpen = false;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }

  toggleUserMenu(event?: Event): void {
    event?.stopPropagation();
    if (this.sidebarCollapsed) return;
    this.userMenuOpen = !this.userMenuOpen;
  }

  closeUserMenu(): void {
    this.userMenuOpen = false;
  }

  toggleSidebar(): void {
    const nextValue = !this.sidebarCollapsed;
    this.layoutService.setSidebarCollapsed(nextValue);
    this.sidebarCollapsed = nextValue;

    this.userMenuOpen = false;
    this.closeCollapsedHoverImmediately();

    if (this.sidebarCollapsed) {
      this.vehiculosOpen = false;
      this.inventarioOpen = false;
      this.mantenimientosOpen = false;
      this.usuariosOpen = false;
    } else {
      this.syncMenuWithRoute();
    }
  }

  toggleSection(section: MenuSection): void {
    if (this.sidebarCollapsed) return;

    this.vehiculosOpen = section === 'vehiculos' ? !this.vehiculosOpen : false;
    this.inventarioOpen = section === 'inventario' ? !this.inventarioOpen : false;
    this.mantenimientosOpen = section === 'mantenimientos' ? !this.mantenimientosOpen : false;
    this.usuariosOpen = section === 'usuarios' ? !this.usuariosOpen : false;
  }

  openCollapsedHover(section: MenuSection, event: MouseEvent): void {
    if (!this.sidebarCollapsed) return;

    this.cancelCollapsedHoverClose();

    const target = event.currentTarget as HTMLElement | null;
    if (!target) return;

    const rect = target.getBoundingClientRect();
    const panelWidth = section === 'inventario' || section === 'mantenimientos' ? 288 : 256;
    const gap = 12;
    const viewportPadding = 12;

    let top = rect.top;
    let left = rect.right + gap;

    const maxTop = window.innerHeight - viewportPadding - 260;
    if (top > maxTop) {
      top = Math.max(viewportPadding, maxTop);
    }

    if (left + panelWidth > window.innerWidth - viewportPadding) {
      left = Math.max(viewportPadding, rect.left - panelWidth - gap);
    }

    this.collapsedPanelStyle = {
      top: `${top}px`,
      left: `${left}px`,
      width: `${panelWidth}px`,
    };

    this.hoveredCollapsedSection = section;
  }

  scheduleCollapsedHoverClose(): void {
    if (!this.sidebarCollapsed) return;

    this.cancelCollapsedHoverClose();
    this.hoverCloseTimeout = setTimeout(() => {
      this.hoveredCollapsedSection = null;
      this.collapsedPanelStyle = {};
    }, 120);
  }

  cancelCollapsedHoverClose(): void {
    if (this.hoverCloseTimeout) {
      clearTimeout(this.hoverCloseTimeout);
      this.hoverCloseTimeout = null;
    }
  }

  closeCollapsedHoverImmediately(): void {
    this.cancelCollapsedHoverClose();
    this.hoveredCollapsedSection = null;
    this.collapsedPanelStyle = {};
  }

  isRouteActive(prefixes: string | string[]): boolean {
    const currentUrl = this.router.url;
    const routeList = Array.isArray(prefixes) ? prefixes : [prefixes];

    return routeList.some((prefix) => currentUrl === prefix || currentUrl.startsWith(`${prefix}/`));
  }

  onNavigate(): void {
    this.closeMobileMenu();
    this.closeUserMenu();
    this.closeCollapsedHoverImmediately();
  }

  onLogout(): void {
    this.closeUserMenu();
    this.closeMobileMenu();
    this.closeCollapsedHoverImmediately();
    this.authService.logout();
    this.router.navigate(['/']);
  }

  private syncMenuWithRoute(): void {
    const url = this.router.url;

    if (this.sidebarCollapsed) return;

    this.vehiculosOpen = url === '/vehiculos' || url.startsWith('/vehiculos/');
    this.inventarioOpen = url === '/inventario' || url.startsWith('/inventario/');
    this.mantenimientosOpen = url === '/mantenimientos' || url.startsWith('/mantenimientos/');
    this.usuariosOpen = url === '/usuarios' || url.startsWith('/usuarios/');
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    if (this.sidebarCollapsed) {
      this.closeCollapsedHoverImmediately();
    }
  }

  @HostListener('document:click')
  onDocClick(): void {
    this.userMenuOpen = false;
  }
}