import { Routes } from '@angular/router';
import { authGuard } from '@src/core/guards/auth.guard';

import { LoginPage } from '@src/pages/auth/login/login';
import { Dashboard } from '@src/pages/dashboard/dashboard';
import { Admin } from '@src/pages/admin/admin';
import { ClientsPage } from '@src/domains/clients/pages/clients';
// Loans group
import { LoansPage } from '@src/domains/loans/pages/loans/loans';
import { LoanProductsPage } from '@src/domains/loans/pages/loan-products/loan-products';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginPage },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },

  // Accounts group
  {
    path: 'accounts',
    children: [
      { path: '', redirectTo: 'gl-accounts', pathMatch: 'full' },
      {
        path: 'gl-accounts',
        loadComponent: () =>
          import('../../domains/accounting/pages/gl-accounts/gl-accounts').then(m => m.GLAccountsPage),
      },
    ],
  },

  { path: 'clients', component: ClientsPage, canActivate: [] },

  // Loans group
  {
    path: 'loans',
    children: [
      { path: '', redirectTo: 'loans', pathMatch: 'full' },
      { path: 'loans', component: LoansPage, canActivate: [] },
      { path: 'loan-products', component: LoanProductsPage, canActivate: [] },
    ],
  },

  { path: 'admin', component: Admin, canActivate: [authGuard] },
  {
    path: 'admin/offices',
    loadComponent: () => import('../../domains/offices/pages/offices').then((m) => m.OfficesAdminPage),
  },
  {
    path: 'admin/users',
    loadComponent: () => import('../../domains/users/pages/users').then((m) => m.UsersAdminPage),
  },
  {
    path: 'admin/roles',
    loadComponent: () => import('../../domains/roles/pages/roles').then((m) => m.RolesAdminPage),
  },
];
