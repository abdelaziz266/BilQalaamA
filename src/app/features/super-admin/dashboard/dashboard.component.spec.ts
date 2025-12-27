import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { DashboardService, DashboardDto } from '../../../core/services/dashboard.service';
import { TokenService, UserRole } from '../../../core/services/token.service';
import { of, throwError } from 'rxjs';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let dashboardService: jasmine.SpyObj<DashboardService>;
  let tokenService: jasmine.SpyObj<TokenService>;

  beforeEach(async () => {
    const dashboardServiceSpy = jasmine.createSpyObj('DashboardService', [
      'getDashboardStats'
    ]);

    const tokenServiceSpy = jasmine.createSpyObj('TokenService', ['getUserRole']);

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: DashboardService, useValue: dashboardServiceSpy },
        { provide: TokenService, useValue: tokenServiceSpy }
      ]
    }).compileComponents();

    dashboardService = TestBed.inject(DashboardService) as jasmine.SpyObj<DashboardService>;
    tokenService = TestBed.inject(TokenService) as jasmine.SpyObj<TokenService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should check if user is superadmin on init', () => {
    tokenService.getUserRole.and.returnValue(UserRole.SuperAdmin);
    fixture.detectChanges();
    expect(component.isSuperAdmin).toBeTruthy();
  });

  it('should not load stats if user is not superadmin', () => {
    tokenService.getUserRole.and.returnValue(UserRole.Teacher);
    fixture.detectChanges();
    expect(component.isSuperAdmin).toBeFalsy();
    expect(dashboardService.getDashboardStats).not.toHaveBeenCalled();
  });

  it('should show all stats for superadmin', () => {
    const mockStats: DashboardDto = {
      supervisorsCount: 5,
      teachersCount: 20,
      totalLessonsCount: 150,
      currentMonthLessonsCount: 45,
      familiesCount: 100,
      studentsCount: 500
    };

    tokenService.getUserRole.and.returnValue(UserRole.SuperAdmin);
    dashboardService.getDashboardStats.and.returnValue(of(mockStats));

    fixture.detectChanges();

    expect(component.shouldShowSupervisors()).toBeTruthy();
    expect(component.shouldShowTeachers()).toBeTruthy();
    expect(component.shouldShowLessons()).toBeTruthy();
    expect(component.shouldShowFamilies()).toBeTruthy();
    expect(component.shouldShowStudents()).toBeTruthy();
  });

  it('should show limited stats for admin', () => {
    tokenService.getUserRole.and.returnValue(UserRole.Admin);

    component.ngOnInit();

    expect(component.shouldShowSupervisors()).toBeFalsy();
    expect(component.shouldShowTeachers()).toBeFalsy();
    expect(component.shouldShowLessons()).toBeTruthy();
    expect(component.shouldShowFamilies()).toBeTruthy();
    expect(component.shouldShowStudents()).toBeTruthy();
  });

  it('should show only lessons and students for teacher', () => {
    tokenService.getUserRole.and.returnValue(UserRole.Teacher);

    component.ngOnInit();

    expect(component.shouldShowSupervisors()).toBeFalsy();
    expect(component.shouldShowTeachers()).toBeFalsy();
    expect(component.shouldShowLessons()).toBeTruthy();
    expect(component.shouldShowCurrentMonthLessons()).toBeTruthy();
    expect(component.shouldShowFamilies()).toBeFalsy();
    expect(component.shouldShowStudents()).toBeTruthy();
  });

  it('should handle error when loading stats', () => {
    tokenService.getUserRole.and.returnValue(UserRole.SuperAdmin);
    dashboardService.getDashboardStats.and.returnValue(throwError(() => new Error('API Error')));

    fixture.detectChanges();

    expect(component.errorMessage).toBeTruthy();
    expect(component.isLoading).toBeFalsy();
  });

  it('should unsubscribe on destroy', () => {
    tokenService.getUserRole.and.returnValue(UserRole.SuperAdmin);
    const mockStats: DashboardDto = {
      supervisorsCount: 5,
      teachersCount: 20,
      totalLessonsCount: 150,
      currentMonthLessonsCount: 45,
      familiesCount: 100,
      studentsCount: 500
    };
    dashboardService.getDashboardStats.and.returnValue(of(mockStats));

    fixture.detectChanges();

    spyOn(component['destroy$'], 'next');
    spyOn(component['destroy$'], 'complete');

    component.ngOnDestroy();

    expect(component['destroy$'].next).toHaveBeenCalled();
    expect(component['destroy$'].complete).toHaveBeenCalled();
  });
});
