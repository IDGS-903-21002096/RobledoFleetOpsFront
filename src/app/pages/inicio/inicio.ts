import { Component } from '@angular/core';

import { CabeceraComponent } from '../../components/cabecera/cabecera';
import { FooterComponent } from '../../components/footer/footer';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CabeceraComponent, FooterComponent],
  templateUrl: './inicio.html',
})
export class InicioComponent {}
