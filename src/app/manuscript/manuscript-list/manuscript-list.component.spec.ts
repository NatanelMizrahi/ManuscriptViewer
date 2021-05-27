import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManuscriptListComponent } from './manuscript-list.component';

describe('ManuscriptListComponent', () => {
  let component: ManuscriptListComponent;
  let fixture: ComponentFixture<ManuscriptListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManuscriptListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManuscriptListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
