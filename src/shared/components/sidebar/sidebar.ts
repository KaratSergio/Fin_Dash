import { Component, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Logout } from '@shared/components/logout/logout';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, Logout, MatIconModule],
  template: `
    <nav class="sidebar">
      <div class="links">
        <a routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
        <a routerLink="/clients" routerLinkActive="active">Clients</a>
        <a routerLink="/charges" routerLinkActive="active">Charges</a>

        <!-- Accounts Group -->
        <div
          class="menu-group"
          routerLinkActive="active-group"
          [routerLinkActiveOptions]="{ exact: false }"
        >
          <a (click)="toggleMenu('accounts')">
            Accounts
            <mat-icon class="arrow">
              {{ menuState.accounts() ? 'expand_more' : 'chevron_right' }}
            </mat-icon>
          </a>

          <div class="sub-links">
            @if (menuState.accounts()) {
              <a routerLink="/accounts/gl-accounts" routerLinkActive="active-sub">GL Accounts</a>
              <a routerLink="/accounts/journal-entries" routerLinkActive="active-sub">Journal Entries</a>
            }
          </div>
        </div>

        <!-- Loans Group -->
        <div
          class="menu-group"
          routerLinkActive="active-group"
          [routerLinkActiveOptions]="{ exact: false }"
        >
          <a (click)="toggleMenu('loans')">
            Loans
            <mat-icon class="arrow">
              {{ menuState.loans() ? 'expand_more' : 'chevron_right' }}
            </mat-icon>
          </a>

          <div class="sub-links">
            @if (menuState.loans()) {
              <a routerLink="/loans/list" routerLinkActive="active-sub">Loans</a>
              <a routerLink="/loans/products" routerLinkActive="active-sub">Loan Products</a>
            }
          </div>
        </div>

        <a routerLink="/admin" routerLinkActive="active">Admin</a>
      </div>

      <div class="logout">
        <app-logout></app-logout>
      </div>
    </nav>
  `,
  styles: [
    `
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
          cursor: pointer;
        }

        a:hover {
          color: #c3eb25;
        }

        a.active,
        a.active-group {
          color: #c3eb25;
          font-weight: bold;
        }

        a.active-group::before {
          content: '';
          position: absolute;
          left: -1rem;
          top: 0;
          bottom: 0;
          width: 4px;
          background-color: #c3eb25;
          border-radius: 2px;
        }

        a.active-sub {
          color: #c3eb25;
          font-weight: normal;
        }

        .menu-group {
          display: flex;
          flex-direction: column;
        }

        .sub-links {
          display: flex;
          flex-direction: column;
          padding-left: 1rem;
          gap: 0.25rem;
        }

        .arrow {
          float: right;
        }

        .logout {
          margin-top: auto;
        }
      }
    `,
  ],
})
export class Sidebar {
  menuState = {
    loans: signal(false),
    accounts: signal(false),
  };

  toggleMenu(key: keyof typeof this.menuState) {
    const current = this.menuState[key]();
    this.menuState[key].set(!current);
  }
}
