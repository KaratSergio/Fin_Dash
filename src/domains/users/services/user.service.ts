import { Injectable, signal, inject, computed, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { tap, catchError, of, switchMap, startWith, firstValueFrom } from 'rxjs';
import { AppError, handleError } from '@core/utils/error';
import { AppUser } from '../interfaces/user.interface';
import { CreateUserDto, UpdateUserDto } from '../interfaces/user.dto';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private http = inject(HttpClient);
  private baseUrl = 'api/fineract/users';

  readonly users = signal<AppUser[]>([]);
  readonly total = computed(() => this.users().length);
  readonly loading = signal(false);
  readonly error = signal<AppError | null>(null);
  private readonly reload = signal(0);

  // automatically re-fetch users when reload changes
  private usersLoader = toSignal(
    toObservable(this.reload).pipe(
      startWith(0),
      tap(() => {
        this.loading.set(true);
        this.error.set(null);
      }),
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
            this.error.set(err.message || 'Failed to load users');
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
    if (err) console.warn('[UsersService]', err);
  });

  // trigger reload
  refresh() {
    this.reload.update((n) => n + 1);
  }

  // CRUD
  async createUser(data: CreateUserDto) {
    this.loading.set(true);

    try {
      await firstValueFrom(this.http.post<AppUser>(this.baseUrl, data));
      this.refresh();
    } catch (err) {
      this.error.set(handleError(err, 'Failed to create user'));
    } finally {
      this.loading.set(false);
    }
  }

  async updateUser(userId: number, data: UpdateUserDto) {
    this.loading.set(true);

    try {
      await firstValueFrom(this.http.put<AppUser>(`${this.baseUrl}/${userId}`, data));
      this.refresh();
    } catch (err) {
      this.error.set(handleError(err, 'Failed to update user'));
    } finally {
      this.loading.set(false);
    }
  }

  async deleteUser(userId: number) {
    this.loading.set(true);

    try {
      await firstValueFrom(this.http.delete<void>(`${this.baseUrl}/${userId}`));
      this.refresh();
    } catch (err) {
      this.error.set(handleError(err, 'Failed to delete user'));
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
    } catch (err) {
      this.error.set(handleError(err, 'Failed to change password'));
    } finally {
      this.loading.set(false);
    }
  }
}