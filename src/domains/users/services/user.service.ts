import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, catchError, of } from 'rxjs';
import { AppUser } from '../interfaces/user.interface';
import { CreateUserDto, UpdateUserDto } from '../interfaces/user.dto';


@Injectable({ providedIn: 'root' })
export class UsersService {
    private http = inject(HttpClient);
    private baseUrl = 'api/fineract/users';

    users = signal<AppUser[]>([]);
    loading = signal(false);
    error = signal<string | null>(null);

    // Fetch all users
    private fetchUsers() {
        this.loading.set(true);

        this.http.get<AppUser[]>(this.baseUrl)
            .pipe(
                tap(list => {
                    const normalized = list.map(user => ({
                        ...user,
                        roles: user.selectedRoles.map(r => r.id) //  IDs only
                    }));
                    this.users.set(normalized);
                }),
                catchError(err => {
                    this.error.set(err.message || 'Failed to load users');
                    return of([]);
                }),
                tap(() => this.loading.set(false))
            ).subscribe();
    }

    // CRUD
    // Public getter for users
    getUsers() {
        this.fetchUsers();
    }

    // Get user by ID
    getUser(userId: number) {
        return this.http
            .get<AppUser>(`${this.baseUrl}/${userId}`);
    }

    // Create new user
    createUser(user: CreateUserDto) {
        return this.http
            .post<AppUser>(this.baseUrl, user)
            .pipe(tap(() => this.fetchUsers()));
    }

    // Update user
    updateUser(userId: number, user: UpdateUserDto) {
        return this.http
            .put<AppUser>(`${this.baseUrl}/${userId}`, user)
            .pipe(tap(() => this.fetchUsers()));
    }

    // Delete user
    deleteUser(userId: number) {
        return this.http
            .delete<void>(`${this.baseUrl}/${userId}`)
            .pipe(tap(() => this.fetchUsers()));
    }

    // ACTIONS
    // Change password
    changePassword(userId: number, newPassword: string) {
        return this.http
            .post<void>(`${this.baseUrl}/${userId}/pwd`, { password: newPassword });
    }
}
