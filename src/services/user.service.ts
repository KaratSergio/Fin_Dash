import { Injectable, signal } from '@angular/core';
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
    users = signal<AppUser[]>([]);
    loading = signal(false);

    constructor(private http: HttpClient) { }

    getUsers(): Observable<AppUser[]> {
        this.loading.set(true);
        return this.http.get<AppUser[]>(`${env.apiBase}/users`).pipe(
            tap({
                next: (list) => this.users.set(list),
                complete: () => this.loading.set(false),
            })
        );
    }

    createUser(user: Partial<AppUser>): Observable<AppUser> {
        return this.http.post<AppUser>(`${env.apiBase}/users`, user).pipe(
            tap(() => this.getUsers())
        );
    }

    updateUser(userId: number, user: Partial<AppUser>): Observable<AppUser> {
        return this.http.put<AppUser>(`${env.apiBase}/users/${userId}`, user).pipe(
            tap(() => this.getUsers())
        );
    }

    deleteUser(userId: number): Observable<void> {
        return this.http.delete<void>(`${env.apiBase}/users/${userId}`).pipe(
            tap(() => this.getUsers())
        );
    }

    changePassword(userId: number, newPassword: string): Observable<void> {
        return this.http.post<void>(`${env.apiBase}/users/${userId}/pwd`, { password: newPassword });
    }

    getUser(userId: number): Observable<AppUser> {
        return this.http.get<AppUser>(`${env.apiBase}/users/${userId}`);
    }
}
