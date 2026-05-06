import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyAttendanceHistoryComponent } from './my-attendance-history.component';

describe('MyAttendanceHistoryComponent', () => {
  let component: MyAttendanceHistoryComponent;
  let fixture: ComponentFixture<MyAttendanceHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyAttendanceHistoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyAttendanceHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
