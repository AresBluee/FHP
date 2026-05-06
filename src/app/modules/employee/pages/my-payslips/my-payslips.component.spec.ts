import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyPayslipsComponent } from './my-payslips.component';

describe('MyPayslipsComponent', () => {
  let component: MyPayslipsComponent;
  let fixture: ComponentFixture<MyPayslipsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyPayslipsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyPayslipsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
