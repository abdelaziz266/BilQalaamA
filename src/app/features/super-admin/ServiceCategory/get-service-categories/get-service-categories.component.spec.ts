import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetServiceCategoriesComponent } from './get-service-categories.component';

describe('GetServiceCategoriesComponent', () => {
  let component: GetServiceCategoriesComponent;
  let fixture: ComponentFixture<GetServiceCategoriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GetServiceCategoriesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GetServiceCategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
