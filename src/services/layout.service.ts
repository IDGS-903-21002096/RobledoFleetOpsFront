import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  private readonly sidebarCollapsedSubject = new BehaviorSubject<boolean>(false);
  readonly sidebarCollapsed$ = this.sidebarCollapsedSubject.asObservable();

  get sidebarCollapsed(): boolean {
    return this.sidebarCollapsedSubject.value;
  }

  setSidebarCollapsed(value: boolean): void {
    this.sidebarCollapsedSubject.next(value);
    localStorage.setItem('fleetops_sidebar_collapsed', String(value));
  }

  loadSidebarState(): void {
    const saved = localStorage.getItem('fleetops_sidebar_collapsed');
    this.sidebarCollapsedSubject.next(saved === 'true');
  }
}