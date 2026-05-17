import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EsparragoComponent } from './esparrago.component';

describe('EsparragoComponent', () => {
  let component: EsparragoComponent;
  let fixture: ComponentFixture<EsparragoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EsparragoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EsparragoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
