import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';

// Auth pages
import { LoginPage } from '@pages/auth/login/login';

// Dashboard
import { Dashboard } from '@pages/dashboard/dashboard';

// Admin
import { Admin } from '@pages/admin/admin';

// Clients
import { ClientsPage } from '@domains/clients/pages/clients';

// Charges
import { ChargesPage } from '@domains/charges/pages/charges';

// Loans
import { LoansPage } from '@domains/loans/pages/loans/loans';
import { LoanProductsPage } from '@domains/loans/pages/loan-products/loan-products';

export const routes: Routes = [
  // --- Default redirect ---
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // --- Auth group ---
  { path: 'login', component: LoginPage },

  // --- Dashboard ---
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },

  // --- Clients ---
  {
    path: 'clients', component: ClientsPage, canActivate: [authGuard],
  },

  // --- Charges ---
  {
    path: 'charges', component: ChargesPage, canActivate: [authGuard],
  },

  // --- Accounts group ---
  {
    path: 'accounts',
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'gl-accounts', pathMatch: 'full' },
      {
        path: 'gl-accounts',
        loadComponent: () =>
          import('../../domains/accounting/pages/gl-accounts/gl-accounts').then(
            (m) => m.GLAccountsPage
          ),
      },
    ],
  },

  // --- Loans group ---
  {
    path: 'loans',
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'list', pathMatch: 'full' },
      { path: 'list', component: LoansPage },
      { path: 'products', component: LoanProductsPage },
    ],
  },

  // --- Admin group ---
  {
    path: 'admin',
    canActivate: [authGuard],
    children: [
      { path: '', component: Admin },
      {
        path: 'offices',
        loadComponent: () =>
          import('../../domains/offices/pages/offices').then(
            (m) => m.OfficesAdminPage
          ),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('../../domains/users/pages/users').then(
            (m) => m.UsersAdminPage
          ),
      },
      {
        path: 'roles',
        loadComponent: () =>
          import('../../domains/roles/pages/roles').then(
            (m) => m.RolesAdminPage
          ),
      },
    ],
  },

  // --- Fallback (optional) ---
  { path: '**', redirectTo: 'dashboard' },
];
