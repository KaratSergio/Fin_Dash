import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, catchError, of } from 'rxjs';
import { env } from '../../server/env/env.dev';
import { Role } from './roles.service';

export interface AppUser {
    id: number;                   // User ID
    username: string;             // Login name
    firstname: string;           // First name
    lastname: string;            // Last name
    email: string;               // Email
    password: string;            // Password (only on create/change)
    sendPasswordToEmail: boolean; // Send password to Email

    officeId: number;             // Office ID the user belongs to
    officeName: string;           // Office name the user belongs to     

    selectedRoles: Role[];        // List of assigned roles
    roles: number[];              // User roles ID
}

@Injectable({ providedIn: 'root' })
export class UsersService {
    private http = inject(HttpClient);
    private baseUrl = `${env.apiBase}/users`;

    // Signals
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
            )
            .subscribe();
    }

    // Public getter for users
    getUsers() {
        this.fetchUsers();
    }

    // Get user by ID
    getUser(userId: number) {
        return this.http.get<AppUser>(`${this.baseUrl}/${userId}`);
    }

    // Create new user
    createUser(user: Partial<AppUser>) {
        return this.http.post<AppUser>(this.baseUrl, user).pipe(
            tap(() => this.fetchUsers())
        );
    }

    // Update user
    updateUser(userId: number, user: Partial<AppUser>) {
        const { id, officeName, selectedRoles, ...payload } = user;
        return this.http.put<AppUser>(`${this.baseUrl}/${userId}`, payload).pipe(
            tap(() => this.fetchUsers())
        );
    }

    // Delete user
    deleteUser(userId: number) {
        return this.http.delete<void>(`${this.baseUrl}/${userId}`).pipe(
            tap(() => this.fetchUsers())
        );
    }

    // Change password
    changePassword(userId: number, newPassword: string) {
        return this.http.post<void>(`${this.baseUrl}/${userId}/pwd`, { password: newPassword });
    }
}
