import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { tap, catchError, of, startWith, switchMap, firstValueFrom } from 'rxjs';

import type { Permission } from '../interfaces/permission.interface';
import type { Role } from '../interfaces/role.interface';

import { NotificationService } from '@core/services/notification/notification.service';
import { ROLE_NOTIFICATION_MESSAGES as MSG } from '../constants/notification-messages.const';

@Injectable({ providedIn: 'root' })
export class RolesService {
  private http = inject(HttpClient);
  private notificationService = inject(NotificationService);
  private baseUrl = 'api/fineract/roles';

  readonly roles = signal<Role[]>([]);
  readonly loading = signal(false);
  private readonly reload = signal(0);

  // loader
  private rolesLoader = toSignal(
    toObservable(this.reload).pipe(
      startWith(0),
      tap(() => this.loading.set(true)),
      switchMap(() =>
        this.http.get<Role[]>(this.baseUrl).pipe(
          tap((list) => this.roles.set(list)),
          catchError((err) => {
            this.notificationService.error(MSG.ERROR.LOAD);
            return of([]);
          })
        )
      ),
      tap(() => this.loading.set(false))
    ),
    { initialValue: [] }
  );

  // refresh loader
  refresh() {
    this.reload.update((n) => n + 1);
  }

  // CRUD
  async createRole(role: Partial<Role>) {
    this.loading.set(true);
    try {
      await firstValueFrom(this.http.post<Role>(this.baseUrl, role));
      this.notificationService.success(MSG.SUCCESS.CREATED);
      this.refresh();
    } catch (err) {
      this.notificationService.error(MSG.ERROR.CREATE);
    } finally {
      this.loading.set(false);
    }
  }

  async updateRole(roleId: number, role: Partial<Role>) {
    this.loading.set(true);
    try {
      const { disabled, ...payload } = role;
      await firstValueFrom(this.http.put<Role>(`${this.baseUrl}/${roleId}`, payload));
      this.notificationService.success(MSG.SUCCESS.UPDATED);
      this.refresh();
    } catch (err) {
      this.notificationService.error(MSG.ERROR.UPDATE);
    } finally {
      this.loading.set(false);
    }
  }

  async deleteRole(roleId: number) {
    this.loading.set(true);
    try {
      await firstValueFrom(this.http.delete<void>(`${this.baseUrl}/${roleId}`));
      this.notificationService.success(MSG.SUCCESS.DELETED);
      this.refresh();
    } catch (err) {
      this.notificationService.error(MSG.ERROR.DELETE);
    } finally {
      this.loading.set(false);
    }
  }

  async enableRole(roleId: number) {
    try {
      await firstValueFrom(this.http.post<void>(`${this.baseUrl}/${roleId}?command=enable`, {}));
      this.notificationService.success(MSG.SUCCESS.ENABLED);
      this.refresh();
    } catch (err) {
      this.notificationService.error(MSG.ERROR.ENABLE);
    }
  }

  async disableRole(roleId: number) {
    try {
      await firstValueFrom(this.http.post<void>(`${this.baseUrl}/${roleId}?command=disable`, {}));
      this.notificationService.success(MSG.SUCCESS.DISABLED);
      this.refresh();
    } catch (err) {
      this.notificationService.error(MSG.ERROR.DISABLE);
    }
  }

  getPermissions(roleId: number) {
    return this.http.get<Permission[]>(`${this.baseUrl}/${roleId}/permissions`);
  }

  async updatePermissions(roleId: number, permissions: Permission[]) {
    try {
      await firstValueFrom(this.http.put<void>(`${this.baseUrl}/${roleId}/permissions`, permissions));
      this.notificationService.success(MSG.SUCCESS.PERMISSIONS_UPDATED);
      this.refresh();
    } catch (err) {
      this.notificationService.error(MSG.ERROR.UPDATE_PERMISSIONS);
    }
  }
}