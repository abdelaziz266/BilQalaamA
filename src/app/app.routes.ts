import { Routes } from '@angular/router';
import { NoAuthGuard } from './core/guard/no-auth.guard';
import { AuthGuard } from './core/guard/auth.guard';
import { RoleGuard } from './core/guard/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'Supervisors',
    pathMatch: 'full'
  },

  {
    path: '',
    loadComponent: () => import('./features/auth/auth.component').then((m) => m.AuthComponent),
    children: [
      { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent), canActivate: [NoAuthGuard] }
    ]
  },
  {
    path: '',
    loadComponent: () => import('./features/features.component').then(m => m.FeaturesComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/super-admin/super-admin.component').then(m => m.SuperAdminComponent),
        children: [
          {
            path: 'Supervisors',
            loadComponent: () => import('./features/super-admin/supervisors/supervisors-home/supervisors-home.component').then(m => m.SupervisorsHomeComponent),
            canActivate: [AuthGuard, RoleGuard]
          },
          {
            path: 'Teachers',
            loadComponent: () => import('./features/super-admin/teachers/teachers-home/teachers-home.component').then(m => m.TeachersHomeComponent),
            canActivate: [AuthGuard, RoleGuard]
          },
          {
            path: 'Families',
            loadComponent: () => import('./features/super-admin/families/families-home/families-home.component').then(m => m.FamiliesHomeComponent),
            canActivate: [AuthGuard, RoleGuard]
          },
          {
            path: 'Students',
            loadComponent: () => import('./features/super-admin/students/students-home/students-home.component').then(m => m.StudentsHomeComponent),
            canActivate: [AuthGuard, RoleGuard]
          },
          {
            path: 'Lessons',
            loadComponent: () => import('./features/super-admin/lessons/lessons-home/lessons-home.component').then(m => m.LessonsHomeComponent),
            canActivate: [AuthGuard, RoleGuard]
          }
        ]
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'Supervisors',
    pathMatch: 'full'
  }
] as const;
