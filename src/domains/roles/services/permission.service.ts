import { Injectable, inject, signal, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { tap, catchError, of, startWith, switchMap } from 'rxjs';
import { Permission } from '../interfaces/permission.interface';
import { AppError } from '@core/utils/error';

@Injectable({ providedIn: 'root' })
export class PermissionsService {
  private http = inject(HttpClient);
  private baseUrl = 'api/fineract/permissions';

  readonly permissions = signal<Permission[]>([]);
  readonly loading = signal(false);
  readonly error = signal<AppError | null>(null);
  private readonly reload = signal(0);

  // loader
  private permissionsLoader = toSignal(
    toObservable(this.reload).pipe(
      startWith(0),
      tap(() => {
        this.loading.set(true);
        this.error.set(null);
      }),
      switchMap(() =>
        this.http.get<Permission[]>(`${this.baseUrl}?makerCheckerable=true`).pipe(
          tap((list) => this.permissions.set(list)),
          catchError((err) => {
            this.error.set(err.message || 'Failed to load permissions');
            return of([]);
          })
        )
      ),
      tap(() => this.loading.set(false))
    ),
    { initialValue: [] }
  );

  // log errors
  private logErrors = effect(() => {
    const err = this.error();
    if (err) console.warn('[PermissionsService]', err);
  });

  // refresh loader
  refresh() {
    this.reload.update((n) => n + 1);
  }

  // Update MakerChecker permissions
  updateMakerChecker(permissionsMap: Record<string, boolean>) {
    return this.http.put(this.baseUrl, { permissions: permissionsMap }).pipe(
      tap(() => this.refresh()),
      catchError((err) => {
        this.error.set(err.message || 'Failed to update permissions');
        return of(null);
      })
    );
  }
}

