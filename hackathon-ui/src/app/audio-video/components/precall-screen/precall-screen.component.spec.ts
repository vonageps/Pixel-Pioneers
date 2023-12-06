import {ComponentFixture, TestBed} from '@angular/core/testing';

import {PrecallScreenComponent} from './precall-screen.component';

describe('PrecallScreenComponent', () => {
  let component: PrecallScreenComponent;
  let fixture: ComponentFixture<PrecallScreenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PrecallScreenComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrecallScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
