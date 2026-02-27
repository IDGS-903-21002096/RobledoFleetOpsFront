import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroRol } from './registro-rol';

describe('RegistroRol', () => {
  let component: RegistroRol;
  let fixture: ComponentFixture<RegistroRol>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistroRol]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistroRol);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
