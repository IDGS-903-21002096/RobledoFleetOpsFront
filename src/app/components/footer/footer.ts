import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutService } from '../../../services/layout.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class FooterComponent implements OnInit {
  private layoutService = inject(LayoutService);

  year = new Date().getFullYear();

  sidebarCollapsed = false;

  ngOnInit(): void {
    this.layoutService.loadSidebarState();

    this.layoutService.sidebarCollapsed$.subscribe((collapsed) => {
      this.sidebarCollapsed = collapsed;
    });
  }
}