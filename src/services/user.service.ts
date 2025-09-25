import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { env } from '../env/env.dev';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

export interface AppUser {
    id: number;
    username: string;
    firstname?: string;
    lastname?: string;
    email?: string;
    password: string;
    officeId: number,
    roles: string[];
}

@Injectable({ providedIn: 'root' })
export class UsersService {
    private http = inject(HttpClient)

    users = signal<AppUser[]>([]);
    loading = signal(false);

    // Get all users list in office
    getUsers(): Observable<AppUser[]> {
        this.loading.set(true);
        return this.http.get<AppUser[]>(`${env.apiBase}/users`).pipe(
            tap({
                next: (list) => this.users.set(list),
                complete: () => this.loading.set(false),
            })
        );
    }

    // Create new user in office
    createUser(user: Partial<AppUser>): Observable<AppUser> {
        return this.http.post<AppUser>(`${env.apiBase}/users`, user).pipe(
            tap(() => this.getUsers())
        );
    }

    // Update user
    updateUser(userId: number, user: Partial<AppUser>): Observable<AppUser> {
        return this.http.put<AppUser>(`${env.apiBase}/users/${userId}`, user).pipe(
            tap(() => this.getUsers())
        );
    }

    // Remove user
    deleteUser(userId: number): Observable<void> {
        return this.http.delete<void>(`${env.apiBase}/users/${userId}`).pipe(
            tap(() => this.getUsers())
        );
    }

    // Change user password
    changePassword(userId: number, newPassword: string): Observable<void> {
        return this.http.post<void>(`${env.apiBase}/users/${userId}/pwd`, { password: newPassword });
    }

    // Get user by ID
    getUser(userId: number): Observable<AppUser> {
        return this.http.get<AppUser>(`${env.apiBase}/users/${userId}`);
    }
}
