import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArandanosComponent } from './arandanos.component';

describe('ArandanosComponent', () => {
  let component: ArandanosComponent;
  let fixture: ComponentFixture<ArandanosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArandanosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArandanosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
