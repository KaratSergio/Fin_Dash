import { Component, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Logout } from '@src/components/logout/logout';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, Logout, MatIconModule],
  template: `
    <nav class="sidebar">
      <div class="links">
        <a routerLink="/overview" routerLinkActive="active">Overview</a>
        <a routerLink="/accounts" routerLinkActive="active">Accounts</a>
        <a routerLink="/transactions" routerLinkActive="active">Transactions</a>
        <a routerLink="/payments" routerLinkActive="active">Payments</a>
        <a routerLink="/analytics" routerLinkActive="active">Analytics</a>
        <a routerLink="/clients" routerLinkActive="active">Clients</a>

        <!-- Credits Group -->
        <div class="menu-group">
          <a
            (click)="toggleCredits()"
            [class.active-group]="creditsOpen()"
          >
            Credits
            <mat-icon class="arrow">
              {{ creditsOpen() ? 'expand_more' : 'chevron_right' }}
            </mat-icon>
          </a>

          <div class="sub-links">
            @if(creditsOpen()) {
              <a
                routerLink="/credits/loans"
                routerLinkActive="active-sub"
                [routerLinkActiveOptions]="{ exact: true }"
              >
                Loans
              </a>
              <a
                routerLink="/credits/loan-products"
                routerLinkActive="active-sub"
                [routerLinkActiveOptions]="{ exact: true }"
              >
                Loan Products
              </a>
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
  `]
})
export class Sidebar {
  creditsOpen = signal(false);

  toggleCredits() {
    this.creditsOpen.set(!this.creditsOpen());
  }
}
