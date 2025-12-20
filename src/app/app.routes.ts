import { Routes } from '@angular/router';
import { NoAuthGuard } from './core/guard/no-auth.guard';
import { AuthGuard } from './core/guard/auth.guard';

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
            canActivate: [AuthGuard]

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
