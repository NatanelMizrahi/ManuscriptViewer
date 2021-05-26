import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManuscriptPageComponent } from './manuscript-page.component';

describe('ManuscriptPageComponent', () => {
  let component: ManuscriptPageComponent;
  let fixture: ComponentFixture<ManuscriptPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManuscriptPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManuscriptPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
