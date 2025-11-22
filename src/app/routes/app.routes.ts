import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { permissionGuard } from '@core/guards/permission.guard';

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

// wrapper route
const secure = (path: string, component: any, permission?: string) => ({
  path,
  component,
  canActivate: permission ? [authGuard, permissionGuard] : [authGuard],
  data: permission ? { permission } : {},
});

// wrapper lazZzy route
const secureLazy = (path: string, loadComponent: () => Promise<any>, permission?: string) => ({
  path,
  loadComponent,
  canActivate: permission ? [authGuard, permissionGuard] : [authGuard],
  data: permission ? { permission } : {},
});

export const routes: Routes = [
  // --- Default redirect ---
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // --- Auth group ---
  { path: 'login', component: LoginPage },

  // --- Dashboard ---
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },

  // --- Clients ---
  {
    path: 'clients',
    component: ClientsPage,
    canActivate: [authGuard],
  },

  // --- Charges ---
  {
    path: 'charges',
    component: ChargesPage,
    canActivate: [],
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
            (m) => m.GLAccountsPage,
          ),
      },
      {
        path: 'journal-entries',
        loadComponent: () =>
          import('../../domains/accounting/pages/journal-entries/journal-entries').then(
            (m) => m.JournalEntriesPage,
          ),
      },
    ],
  },

  // --- Loans group ---
  {
    path: 'loans',
    canActivate: [],
    children: [
      { path: '', redirectTo: 'list', pathMatch: 'full' },
      { path: 'list', component: LoansPage },
      { path: 'products', component: LoanProductsPage },
    ],
  },

  // --- Admin group ---
  {
    path: 'admin',
    children: [
      secure('', Admin),
      secureLazy('offices', () =>
        import('../../domains/offices/pages/offices').then((m) => m.OfficesAdminPage),
      ),
      secureLazy('users', () =>
        import('../../domains/users/pages/users').then((m) => m.UsersAdminPage),
      ),
      secureLazy('roles', () =>
        import('../../domains/roles/pages/roles').then((m) => m.RolesAdminPage),
      ),
    ],
  },

  // --- Fallback (optional) ---
  { path: '**', redirectTo: 'dashboard' },
];
