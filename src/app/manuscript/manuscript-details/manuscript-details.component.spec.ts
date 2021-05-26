import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManuscriptDetailsComponent } from './manuscript-details.component';

describe('ManuscriptDetailsComponent', () => {
  let component: ManuscriptDetailsComponent;
  let fixture: ComponentFixture<ManuscriptDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManuscriptDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManuscriptDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
