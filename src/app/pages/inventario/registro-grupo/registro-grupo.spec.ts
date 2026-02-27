import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroGrupo } from './registro-grupo';

describe('RegistroGrupo', () => {
  let component: RegistroGrupo;
  let fixture: ComponentFixture<RegistroGrupo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistroGrupo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistroGrupo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
