import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule],
  template: `
    <nav class="sidebar">
      <a routerLink="/overview" routerLinkActive="active">Overview</a>
      <a routerLink="/accounts" routerLinkActive="active">Accounts</a>
      <a routerLink="/transactions" routerLinkActive="active">Transactions</a>
      <a routerLink="/payments" routerLinkActive="active">Payments</a>
      <a routerLink="/analytics" routerLinkActive="active">Analytics</a>
      <a routerLink="/admin" routerLinkActive="active">Admin</a>
    </nav>
  `,
  styles: [
    `
      .sidebar {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding: 1rem;
        height: 100vh;
        border-right: 2px solid #c3eb25;

        a {
          text-decoration: none;
          color: white;
          padding: 0.25rem 0;
          position: relative;

          &:hover {
            color: #c3eb25;
          }

          &.active {
            color: #c3eb25;
            font-weight: bold;

            &::before {
              content: '';
              position: absolute;
              left: -1rem;
              top: 0;
              bottom: 0;
              width: 4px;
              background-color: #c3eb25;
              border-radius: 2px;
            }
          }
        }
      }
    `,
  ],
})
export class Sidebar {}
