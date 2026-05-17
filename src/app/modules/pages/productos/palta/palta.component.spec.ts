import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaltaComponent } from './palta.component';

describe('PaltaComponent', () => {
  let component: PaltaComponent;
  let fixture: ComponentFixture<PaltaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaltaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaltaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
