import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StepperEstadosComponent } from './stepper-estados.component';

describe('StepperEstadosComponent', () => {
  let component: StepperEstadosComponent;
  let fixture: ComponentFixture<StepperEstadosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StepperEstadosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StepperEstadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
