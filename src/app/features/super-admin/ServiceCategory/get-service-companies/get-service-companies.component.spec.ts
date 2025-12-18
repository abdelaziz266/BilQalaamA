import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetServiceCompaniesComponent } from './get-service-companies.component';

describe('GetServiceCompaniesComponent', () => {
  let component: GetServiceCompaniesComponent;
  let fixture: ComponentFixture<GetServiceCompaniesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GetServiceCompaniesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GetServiceCompaniesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
