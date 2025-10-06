import { Routes } from '@angular/router';
import { authGuard } from '@src/guards/auth.guard';

import { LoginPage } from '@src/pages/auth/login/login';

import { Overview } from '@src/pages/overview/overview';
import { Accounts } from '@src/pages/accounts/accounts';
import { Transactions } from '@src/pages/transactions/transactions';
import { Payments } from '@src/pages/payments/payments';
import { Analytics } from '@src/pages/analytics/analytics';
import { Admin } from '@src/pages/admin/admin';
import { ClientsPage } from '@src/pages/clients/clients';
import { LoansPage } from '@src/pages/loans/loans';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginPage },

  // SPA
  { path: 'overview', component: Overview, canActivate: [authGuard] },
  { path: 'accounts', component: Accounts, canActivate: [authGuard] },
  { path: 'transactions', component: Transactions, canActivate: [authGuard] },
  { path: 'payments', component: Payments, canActivate: [authGuard] },
  { path: 'analytics', component: Analytics, canActivate: [authGuard] },
  { path: 'clients', component: ClientsPage, canActivate: [] },
  { path: 'loans', component: LoansPage, canActivate: [] },

  { path: 'admin', component: Admin, canActivate: [authGuard] },
  {
    path: 'admin/offices',
    loadComponent: () => import('../pages/admin/offices/offices').then((m) => m.OfficesAdminPage),
  },
  {
    path: 'admin/users',
    loadComponent: () => import('../pages/admin/users/users').then((m) => m.UsersAdminPage),
  },
  {
    path: 'admin/roles',
    loadComponent: () => import('../pages/admin/roles/roles').then((m) => m.RolesAdminPage),
  },
  {
    path: 'admin/settings',
    loadComponent: () =>
      import('../pages/admin/settings/settings').then((m) => m.SettingsAdminPage),
  },
  {
    path: 'admin/logs',
    loadComponent: () => import('../pages/admin/logs/logs').then((m) => m.LogsAdminPage),
  },
];
