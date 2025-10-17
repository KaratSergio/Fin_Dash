import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, catchError, of } from 'rxjs';
import { Permission } from './permission.service';

export interface Role {
    id: number;             // Role ID
    name: string;           // Role name
    description?: string;   // Optional description
    disabled?: boolean;     // Whether role is disabled
}

@Injectable({ providedIn: 'root' })
export class RolesService {
    private http = inject(HttpClient);
    private baseUrl = 'api/fineract/roles';

    roles = signal<Role[]>([]);
    loading = signal(false);
    error = signal<string | null>(null);

    // CRUD
    // Private fetch method
    private fetchRoles() {
        this.loading.set(true);

        this.http.get<Role[]>(this.baseUrl)
            .pipe(
                tap(list => this.roles.set(list)),
                catchError(err => {
                    this.error.set(err.message || 'Failed to load roles');
                    return of([]);
                }),
                tap(() => this.loading.set(false))
            ).subscribe();
    }

    // Get all roles
    getRoles() {
        this.fetchRoles();
    }

    // Get role by ID
    getRole(roleId: number) {
        return this.http.get<Role>(`${this.baseUrl}/${roleId}`);
    }

    // Create new role
    createRole(role: Partial<Role>) {
        return this.http.post<Role>(this.baseUrl, role).pipe(
            tap(() => this.fetchRoles())
        );
    }

    // Update role by ID
    updateRole(roleId: number, role: Partial<Role>) {
        const { disabled, ...payload } = role;
        return this.http.put<Role>(`${this.baseUrl}/${roleId}`, payload).pipe(
            tap(() => this.fetchRoles())
        );
    }

    // Delete role by ID
    deleteRole(roleId: number) {
        return this.http.delete<void>(`${this.baseUrl}/${roleId}`).pipe(
            tap(() => this.fetchRoles())
        );
    }

    // ACTION
    // Enable role
    enableRole(roleId: number) {
        return this.http.post<void>(`${this.baseUrl}/${roleId}?command=enable`, {}).pipe(
            tap(() => this.fetchRoles())
        );
    }

    // Disable role
    disableRole(roleId: number) {
        return this.http.post<void>(`${this.baseUrl}/${roleId}?command=disable`, {}).pipe(
            tap(() => this.fetchRoles())
        );
    }

    // Get role permissions
    getPermissions(roleId: number) {
        return this.http.get<Permission[]>(`${this.baseUrl}/${roleId}/permissions`);
    }

    // Update role permissions
    updatePermissions(roleId: number, permissions: Permission[]) {
        return this.http.put<void>(`${this.baseUrl}/${roleId}/permissions`, permissions).pipe(
            tap(() => this.fetchRoles())
        );
    }
}
