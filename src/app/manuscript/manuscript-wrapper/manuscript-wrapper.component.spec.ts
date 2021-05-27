import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManuscriptWrapperComponent } from './manuscript-wrapper.component';

describe('ManuscriptWrapperComponent', () => {
  let component: ManuscriptWrapperComponent;
  let fixture: ComponentFixture<ManuscriptWrapperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManuscriptWrapperComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManuscriptWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
