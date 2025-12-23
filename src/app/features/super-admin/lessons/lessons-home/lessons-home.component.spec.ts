import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LessonsHomeComponent } from './lessons-home.component';

describe('LessonsHomeComponent', () => {
  let component: LessonsHomeComponent;
  let fixture: ComponentFixture<LessonsHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LessonsHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LessonsHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
