import { Routes } from '@angular/router';
import { Overview } from '../pages/overview/overview';
import { Accounts } from '../pages/accounts/accounts';
import { Transactions } from '../pages/transactions/transactions';
import { Payments } from '../pages/payments/payments';
import { Analytics } from '../pages/analytics/analytics';
import { Admin } from '../pages/admin/admin';

export const routes: Routes = [
    { path: '', redirectTo: 'overview', pathMatch: 'full' },
    { path: 'overview', component: Overview },
    { path: 'accounts', component: Accounts },
    { path: 'transactions', component: Transactions },
    { path: 'payments', component: Payments },
    { path: 'analytics', component: Analytics },
    { path: 'admin', component: Admin },
];
