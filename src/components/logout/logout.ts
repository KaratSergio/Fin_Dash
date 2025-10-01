import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@src/services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { handleError, AuthError } from '@src/utils/error';

@Component({
  selector: 'app-logout',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <button (click)="logout()">
      <mat-icon>logout</mat-icon>
    </button>
  `,
  styles: [`
    button { 
      cursor: pointer;
      background-color: inherit;
      border: none;
    }
    button mat-icon { 
      color: white;
    }
  `]
})
export class Logout {
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  error = signal<AuthError | null>(null);

  async logout() {
    this.loading.set(true);
    this.error.set(null);

    try {
      await this.auth.logout();
      this.router.navigate(['/login']);
    } catch (err: unknown) {
      this.error.set(handleError(err, 'Logout failed'));
    } finally {
      this.loading.set(false);
    }
  }
}
