import { Injectable, inject, signal, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { tap, catchError, of, startWith, switchMap, firstValueFrom} from 'rxjs';
import { Permission } from '../interfaces/permission.interface';
import { Role } from '../interfaces/role.interface';
import { AppError, handleError } from '@core/utils/error';


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
  async createRole(role: Partial<Role>) {
    this.loading.set(true);
    try {
      await firstValueFrom(this.http.post<Role>(this.baseUrl, role));
      this.refresh();
    } catch (err) {
      this.error.set(handleError(err, 'Failed to create role'));
    } finally {
      this.loading.set(false);
    }
  }

  async updateRole(roleId: number, role: Partial<Role>) {
    this.loading.set(true);
    try {
      const { disabled, ...payload } = role;
      await firstValueFrom(this.http.put<Role>(`${this.baseUrl}/${roleId}`, payload));
      this.refresh();
    } catch (err) {
      this.error.set(handleError(err, 'Failed to update role'));
    } finally {
      this.loading.set(false);
    }
  }

  async deleteRole(roleId: number) {
    this.loading.set(true);
    try {
      await firstValueFrom(this.http.delete<void>(`${this.baseUrl}/${roleId}`));
      this.refresh();
    } catch (err) {
      this.error.set(handleError(err, 'Failed to delete role'));
    } finally {
      this.loading.set(false);
    }
  }

  async enableRole(roleId: number) {
    try {
      await firstValueFrom(this.http.post<void>(`${this.baseUrl}/${roleId}?command=enable`, {}));
      this.refresh();
    } catch (err) {
      this.error.set(handleError(err, 'Failed to enable role'));
    }
  }

  async disableRole(roleId: number) {
    try {
      await firstValueFrom(this.http.post<void>(`${this.baseUrl}/${roleId}?command=disable`, {}));
      this.refresh();
    } catch (err) {
      this.error.set(handleError(err, 'Failed to disable role'));
    }
  }

  getPermissions(roleId: number) {
    return this.http.get<Permission[]>(`${this.baseUrl}/${roleId}/permissions`);
  }

  async updatePermissions(roleId: number, permissions: Permission[]) {
    try {
      await firstValueFrom(this.http.put<void>(`${this.baseUrl}/${roleId}/permissions`, permissions));
      this.refresh();
    } catch (err) {
      this.error.set(handleError(err, 'Failed to update role permissions'));
    }
  }
}