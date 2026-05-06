import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentDownloaderComponent } from './document-downloader.component';

describe('DocumentDownloaderComponent', () => {
  let component: DocumentDownloaderComponent;
  let fixture: ComponentFixture<DocumentDownloaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentDownloaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentDownloaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
