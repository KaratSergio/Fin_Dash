import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Logout } from '@src/components/logout/logout';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, Logout],
  template: `
    <nav class="sidebar">
      <div class="links">
        <a routerLink="/overview" routerLinkActive="active">Overview</a>
        <a routerLink="/accounts" routerLinkActive="active">Accounts</a>
        <a routerLink="/transactions" routerLinkActive="active">Transactions</a>
        <a routerLink="/payments" routerLinkActive="active">Payments</a>
        <a routerLink="/analytics" routerLinkActive="active">Analytics</a>
        <a routerLink="/clients" routerLinkActive="active">Clients</a>
        <a routerLink="/admin" routerLinkActive="active">Admin</a>
      </div>

      <div class="logout">
        <app-logout></app-logout>
      </div>
    </nav>
  `,
  styles: [`
    .sidebar {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 100vh;
      padding: 1rem;
      border-right: 2px solid #c3eb25;

      .links {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      a {
        text-decoration: none;
        color: white;
        padding: 0.25rem 0;
        position: relative;
      }

      a:hover {
        color: #c3eb25;
      }

      a.active {
        color: #c3eb25;
        font-weight: bold;
      }

      a.active::before {
        content: '';
        position: absolute;
        left: -1rem;
        top: 0;
        bottom: 0;
        width: 4px;
        background-color: #c3eb25;
        border-radius: 2px;
      }

      .logout {
        margin-top: auto;
      }
    }
  `]
})
export class Sidebar { }
