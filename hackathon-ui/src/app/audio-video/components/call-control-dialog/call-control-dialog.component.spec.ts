import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CallControlDialogComponent} from './call-control-dialog.component';

describe('CallControlDialogComponent', () => {
  let component: CallControlDialogComponent;
  let fixture: ComponentFixture<CallControlDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CallControlDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CallControlDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
