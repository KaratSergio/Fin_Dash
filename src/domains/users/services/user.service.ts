import { Injectable, signal, inject, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { tap, catchError, of, switchMap, startWith, firstValueFrom } from 'rxjs';

import { AppUser } from '../interfaces/user.interface';
import { CreateUserDto, UpdateUserDto } from '../interfaces/user.dto';

import { NotificationService } from '@core/services/notification/notification.service';
import { USER_NOTIFICATION_MESSAGES as MSG } from '@core/constants/notifications/user-messages.const';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private http = inject(HttpClient);
  private notificationService = inject(NotificationService);
  private baseUrl = 'api/fineract/users';

  readonly users = signal<AppUser[]>([]);
  readonly total = computed(() => this.users().length);
  readonly loading = signal(false);
  private readonly reload = signal(0);

  // automatically re-fetch users when reload changes
  private usersLoader = toSignal(
    toObservable(this.reload).pipe(
      startWith(0),
      tap(() => this.loading.set(true)),
      switchMap(() =>
        this.http.get<AppUser[]>(this.baseUrl).pipe(
          tap((list) => {
            const normalized = list.map((user) => ({
              ...user,
              roles: user.selectedRoles.map((r) => r.id), // IDs only
            }));
            this.users.set(normalized);
          }),
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

  // trigger reload
  refresh() {
    this.reload.update((n) => n + 1);
  }

  // CRUD
  async createUser(data: CreateUserDto) {
    this.loading.set(true);

    try {
      await firstValueFrom(this.http.post<AppUser>(this.baseUrl, data));
      this.notificationService.success(MSG.SUCCESS.CREATED);
      this.refresh();
    } catch (err) {
      this.notificationService.error(MSG.ERROR.CREATE);
    } finally {
      this.loading.set(false);
    }
  }

  async updateUser(userId: number, data: UpdateUserDto) {
    this.loading.set(true);

    try {
      await firstValueFrom(this.http.put<AppUser>(`${this.baseUrl}/${userId}`, data));
      this.notificationService.success(MSG.SUCCESS.UPDATED);
      this.refresh();
    } catch (err) {
      this.notificationService.error(MSG.ERROR.UPDATE);
    } finally {
      this.loading.set(false);
    }
  }

  async deleteUser(userId: number) {
    this.loading.set(true);

    try {
      await firstValueFrom(this.http.delete<void>(`${this.baseUrl}/${userId}`));
      this.notificationService.success(MSG.SUCCESS.DELETED);
      this.refresh();
    } catch (err) {
      this.notificationService.error(MSG.ERROR.DELETE);
    } finally {
      this.loading.set(false);
    }
  }

  // get single user
  getUser(userId: number) {
    return this.http.get<AppUser>(`${this.baseUrl}/${userId}`);
  }

  // ACTIONS
  async changePassword(userId: number, newPassword: string) {
    this.loading.set(true);

    try {
      await firstValueFrom(
        this.http.post<void>(`${this.baseUrl}/${userId}/pwd`, { password: newPassword })
      );
      this.notificationService.success(MSG.SUCCESS.PASSWORD_CHANGED);
    } catch (err) {
      this.notificationService.error(MSG.ERROR.CHANGE_PASSWORD);
    } finally {
      this.loading.set(false);
    }
  }
}