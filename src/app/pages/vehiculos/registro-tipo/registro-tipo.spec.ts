import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroTipo } from './registro-tipo';

describe('RegistroTipo', () => {
  let component: RegistroTipo;
  let fixture: ComponentFixture<RegistroTipo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistroTipo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistroTipo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
