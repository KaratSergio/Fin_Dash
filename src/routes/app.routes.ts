import { Routes } from '@angular/router';
import { AuthGuard } from './../guards/auth.guard';

import { LoginPage } from '../pages/auth/login/login';

import { Overview } from '../pages/overview/overview';
import { Accounts } from '../pages/accounts/accounts';
import { Transactions } from '../pages/transactions/transactions';
import { Payments } from '../pages/payments/payments';
import { Analytics } from '../pages/analytics/analytics';
import { Admin } from '../pages/admin/admin';


export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginPage },

    // SPA
    { path: 'overview', component: Overview, canActivate: [AuthGuard] },
    { path: 'accounts', component: Accounts, canActivate: [AuthGuard] },
    { path: 'transactions', component: Transactions, canActivate: [AuthGuard] },
    { path: 'payments', component: Payments, canActivate: [AuthGuard] },
    { path: 'analytics', component: Analytics, canActivate: [AuthGuard] },
    { path: 'admin', component: Admin, canActivate: [AuthGuard] },
];
