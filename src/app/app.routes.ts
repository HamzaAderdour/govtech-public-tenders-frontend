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
        path: 'tenders',
        loadComponent: () => import('./features/admin/tenders/admin-tenders.component').then(m => m.AdminTendersComponent)
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
        path: 'tenders',
        loadComponent: () => import('./features/owner/tenders/tender-list/tender-list.component').then(m => m.TenderListComponent)
      },
      {
        path: 'tenders/create',
        loadComponent: () => import('./features/owner/tenders/tender-create/tender-create.component').then(m => m.TenderCreateComponent)
      },
      {
        path: 'tenders/:id',
        loadComponent: () => import('./features/owner/tenders/tender-detail/tender-detail.component').then(m => m.TenderDetailComponent)
      },
      {
        path: 'submissions',
        loadComponent: () => import('./features/owner/submissions/submission-list/submission-list.component').then(m => m.SubmissionListComponent)
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
        path: 'tenders',
        loadComponent: () => import('./features/supplier/tenders/tender-list-supplier/tender-list-supplier.component').then(m => m.TenderListSupplierComponent)
      },
      {
        path: 'tenders/:id',
        loadComponent: () => import('./features/supplier/tenders/tender-detail-supplier/tender-detail-supplier.component').then(m => m.TenderDetailSupplierComponent)
      },
      {
        path: 'submissions',
        loadComponent: () => import('./features/supplier/submissions/my-submissions/my-submissions.component').then(m => m.MySubmissionsComponent)
      },
      {
        path: 'submissions/submit/:tenderId',
        loadComponent: () => import('./features/supplier/submissions/submit-submission/submit-submission.component').then(m => m.SubmitSubmissionComponent)
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
