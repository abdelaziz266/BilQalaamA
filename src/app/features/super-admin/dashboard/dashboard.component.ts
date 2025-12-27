import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DashboardService, DashboardDto } from '../../../core/services/dashboard.service';
import { TokenService, UserRole } from '../../../core/services/token.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  stats: DashboardDto = {
    supervisorsCount: 0,
    teachersCount: 0,
    totalLessonsCount: 0,
    currentMonthLessonsCount: 0,
    familiesCount: 0,
    studentsCount: 0
  };

  userRole: UserRole | null = null;
  isSuperAdmin = false;
  isAdmin = false;
  isTeacher = false;
  isLoading = false;
  errorMessage = '';
  private destroy$ = new Subject<void>();

  constructor(
    private dashboardService: DashboardService,
    private tokenService: TokenService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkUserRole();
    if (this.userRole !== null) {
      
      this.loadDashboardStats();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkUserRole(): void {
    this.userRole = this.tokenService.getUserRole();
    this.isSuperAdmin = this.userRole === UserRole.SuperAdmin;
    this.isAdmin = this.userRole === UserRole.Admin;
    this.isTeacher = this.userRole === UserRole.Teacher;
  }

  private loadDashboardStats(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.dashboardService
      .getDashboardStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: DashboardDto) => {
          
          this.stats = data;
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Error loading dashboard stats:', error);
          this.errorMessage = 'حدث خطأ في تحميل بيانات لوحة البيانات. يرجى المحاولة لاحقاً.';
          this.isLoading = false;
        }
      });
  }

  // دوال للتحقق من ما يجب عرضه بناءً على الدور
  shouldShowSupervisors(): boolean {
    return this.isSuperAdmin;
  }

  shouldShowTeachers(): boolean {
    return this.isSuperAdmin;
  }

  shouldShowLessons(): boolean {
    return this.isSuperAdmin || this.isAdmin || this.isTeacher;
  }

  shouldShowCurrentMonthLessons(): boolean {
    return this.isSuperAdmin || this.isAdmin || this.isTeacher;
  }

  shouldShowFamilies(): boolean {
    return this.isSuperAdmin || this.isAdmin;
  }

  shouldShowStudents(): boolean {
    return this.isSuperAdmin || this.isAdmin || this.isTeacher;
  }

  // Navigation methods
  navigateToSupervisors(): void {
    this.router.navigate(['/Supervisors']);
  }

  navigateToTeachers(): void {
    this.router.navigate(['/Teachers']);
  }

  navigateToLessons(): void {
    this.router.navigate(['/Lessons']);
  }

  navigateToFamilies(): void {
    this.router.navigate(['/Families']);
  }

  navigateToStudents(): void {
    this.router.navigate(['/Students']);
  }
}
