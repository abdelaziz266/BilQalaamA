import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { TokenService, UserRole, UserRoleLabels } from '../services/token.service';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private tokenService: TokenService, 
    private router: Router,
    private toastr: ToastrService
  ) { }

  private readonly rolePermissions: Record<UserRole, string[]> = {
    [UserRole.SuperAdmin]: ['dashboard', 'supervisors', 'teachers', 'families', 'students', 'lessons'],
    [UserRole.Admin]: ['dashboard', 'teachers', 'families', 'students', 'lessons'],
    [UserRole.Teacher]: ['dashboard', 'lessons'],
    [UserRole.Student]: [],
    [UserRole.Family]: []
  };

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    
    const userRole = this.tokenService.getUserRole();
    const routePath = state.url.split('/').pop()?.toLowerCase() || '';

    // التحقق من وجود token وصلاحية المستخدم
    if (userRole === null) {
      console.warn('No user role found. Redirecting to login');
      this.toastr.error('الرجاء تسجيل الدخول');
      return this.router.parseUrl('/login');
    }

    // الحصول على الصفحات المسموحة للمستخدم
    const allowedPages = this.rolePermissions[userRole as UserRole] || [];

    // التحقق من أن المستخدم لديه صلاحية للوصول للصفحة
    if (allowedPages.includes(routePath)) {
      return true;
    }

    // في حالة عدم وجود صلاحية
    const roleName = UserRoleLabels[userRole as keyof typeof UserRoleLabels] || 'مستخدم';
    console.warn(`User with role '${roleName}' tried to access '${routePath}'. Access denied.`);
    
    // إعادة التوجيه حسب الدور
    if (userRole === UserRole.SuperAdmin) {
      return this.router.parseUrl('/Dashboard');
    } else if (userRole === UserRole.Admin) {
      return this.router.parseUrl('/Dashboard');
    } else if (userRole === UserRole.Teacher) {
      return this.router.parseUrl('/Dashboard');
    } else {
      this.toastr.error('ليس لديك صلاحيات كافية للوصول لهذه الصفحة');
      return this.router.parseUrl('/login');
    }
  }

  /**
   * دالة مساعدة للتحقق من وجود دور معين
   */
  hasRole(role: UserRole): boolean {
    return this.tokenService.getUserRole() === role;
  }

  /**
   * دالة مساعدة للتحقق من وجود أحد الأدوار
   */
  hasAnyRole(roles: UserRole[]): boolean {
    const userRole = this.tokenService.getUserRole();
    return roles.includes(userRole as UserRole);
  }

  /**
   * دالة مساعدة للتحقق من الوصول لصفحة معينة
   */
  canAccessPage(pagePath: string): boolean {
    const userRole = this.tokenService.getUserRole();
    if (userRole === null) return false;
    
    const allowedPages = this.rolePermissions[userRole as UserRole] || [];
    return allowedPages.includes(pagePath.toLowerCase());
  }
}
