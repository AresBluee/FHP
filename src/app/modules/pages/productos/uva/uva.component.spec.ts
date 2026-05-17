import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UvaComponent } from './uva.component';

describe('UvaComponent', () => {
  let component: UvaComponent;
  let fixture: ComponentFixture<UvaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UvaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UvaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
