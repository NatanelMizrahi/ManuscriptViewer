import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManuscriptFileListComponent } from './manuscript-file-list.component';

describe('ManuscriptFileListComponent', () => {
  let component: ManuscriptFileListComponent;
  let fixture: ComponentFixture<ManuscriptFileListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManuscriptFileListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManuscriptFileListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
