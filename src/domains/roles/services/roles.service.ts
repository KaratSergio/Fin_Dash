import { Injectable, inject, signal, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { tap, catchError, of, startWith, switchMap } from 'rxjs';
import { Permission } from '../interfaces/permission.interface';
import { Role } from '../interfaces/role.interface';
import { AppError } from '@core/utils/error';


@Injectable({ providedIn: 'root' })
export class RolesService {
  private http = inject(HttpClient);
  private baseUrl = 'api/fineract/roles';

  readonly roles = signal<Role[]>([]);
  readonly loading = signal(false);
  readonly error = signal<AppError | null>(null);
  private readonly reload = signal(0);

  // loader
  private rolesLoader = toSignal(
    toObservable(this.reload).pipe(
      startWith(0),
      tap(() => {
        this.loading.set(true);
        this.error.set(null);
      }),
      switchMap(() =>
        this.http.get<Role[]>(this.baseUrl).pipe(
          tap((list) => this.roles.set(list)),
          catchError((err) => {
            this.error.set(err.message || 'Failed to load roles');
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
    if (err) console.warn('[RolesService]', err);
  });

  // refresh loader
  refresh() {
    this.reload.update((n) => n + 1);
  }

  // CRUD
  createRole(role: Partial<Role>) {
    return this.http.post<Role>(this.baseUrl, role).pipe(
      tap(() => this.refresh()),
      catchError((err) => {
        this.error.set(err.message || 'Failed to create role');
        return of(null);
      })
    );
  }

  updateRole(roleId: number, role: Partial<Role>) {
    const { disabled, ...payload } = role;
    return this.http.put<Role>(`${this.baseUrl}/${roleId}`, payload).pipe(
      tap(() => this.refresh()),
      catchError((err) => {
        this.error.set(err.message || 'Failed to update role');
        return of(null);
      })
    );
  }

  deleteRole(roleId: number) {
    return this.http.delete<void>(`${this.baseUrl}/${roleId}`).pipe(
      tap(() => this.refresh()),
      catchError((err) => {
        this.error.set(err.message || 'Failed to delete role');
        return of(null);
      })
    );
  }

  enableRole(roleId: number) {
    return this.http.post<void>(`${this.baseUrl}/${roleId}?command=enable`, {}).pipe(
      tap(() => this.refresh()),
      catchError((err) => {
        this.error.set(err.message || 'Failed to enable role');
        return of(null);
      })
    );
  }

  disableRole(roleId: number) {
    return this.http.post<void>(`${this.baseUrl}/${roleId}?command=disable`, {}).pipe(
      tap(() => this.refresh()),
      catchError((err) => {
        this.error.set(err.message || 'Failed to disable role');
        return of(null);
      })
    );
  }

  getPermissions(roleId: number) {
    return this.http.get<Permission[]>(`${this.baseUrl}/${roleId}/permissions`);
  }

  updatePermissions(roleId: number, permissions: Permission[]) {
    return this.http.put<void>(`${this.baseUrl}/${roleId}/permissions`, permissions).pipe(
      tap(() => this.refresh()),
      catchError((err) => {
        this.error.set(err.message || 'Failed to update role permissions');
        return of(null);
      })
    );
  }
}
