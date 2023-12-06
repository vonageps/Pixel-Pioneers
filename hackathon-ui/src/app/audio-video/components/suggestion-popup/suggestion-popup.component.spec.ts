import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuggestionPopupComponent } from './suggestion-popup.component';

describe('SuggestionPopupComponent', () => {
  let component: SuggestionPopupComponent;
  let fixture: ComponentFixture<SuggestionPopupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SuggestionPopupComponent]
    });
    fixture = TestBed.createComponent(SuggestionPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
