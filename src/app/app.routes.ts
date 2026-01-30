import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards';
import { UserRole } from './core/models';
import { AdminLayoutComponent } from './shared/layouts/admin-layout/admin-layout.component';
import { OwnerLayoutComponent } from './shared/layouts/owner-layout/owner-layout.component';
import { SupplierLayoutComponent } from './shared/layouts/supplier-layout/supplier-layout.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
      }
    ]
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard, roleGuard([UserRole.ADMIN])],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'owner',
    component: OwnerLayoutComponent,
    canActivate: [authGuard, roleGuard([UserRole.OWNER])],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/owner/dashboard/owner-dashboard.component').then(m => m.OwnerDashboardComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'supplier',
    component: SupplierLayoutComponent,
    canActivate: [authGuard, roleGuard([UserRole.SUPPLIER])],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/supplier/dashboard/supplier-dashboard.component').then(m => m.SupplierDashboardComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/auth/login'
  }
];
