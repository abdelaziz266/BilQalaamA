import { Routes } from '@angular/router';
import { NoAuthGuard } from './core/guard/no-auth.guard';
import { AuthGuard } from './core/guard/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'Companies',
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
            path: 'Companies', 
            loadComponent: () => import('./features/super-admin/companies/companies-home/companies-home.component').then(m => m.CompaniesHomeComponent),
            canActivate: [AuthGuard]
          },
          {
            path: 'ServiceCategory', 
            loadComponent: () => import('./features/super-admin/ServiceCategory/get-service-categories/get-service-categories.component').then(m => m.GetServiceCategoriesComponent),
            canActivate: [AuthGuard]
          },
          {
            path: 'serviceCompanies/:serviceId', 
            loadComponent: () => import('./features/super-admin/ServiceCategory/get-service-companies/get-service-companies.component').then(m => m.GetServiceCompaniesComponent),
            canActivate: [AuthGuard]
          }
        ]
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'Companies',
    pathMatch: 'full'
  }
] as const;
