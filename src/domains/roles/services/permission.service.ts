import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of, tap } from 'rxjs';

export interface Permission {
    actionName: string;    // e.g. "READ"
    code: string;          // e.g. "READ_PERMISSION"
    entityName: string;    // e.g. "PERMISSION"
    grouping: string;      // e.g. "authorisation"
    selected: boolean;     // Maker Checker enabled/disabled
}

@Injectable({ providedIn: 'root' })
export class PermissionsService {
    private http = inject(HttpClient);
    private baseUrl = 'api/fineract/permissions';

    permissions = signal<Permission[]>([]);
    loading = signal(false);
    error = signal<string | null>(null);

    // Fetch all permissions
    getPermissions(makerCheckerable = false) {
        this.loading.set(true);
        this.http
            .get<Permission[]>(`${this.baseUrl}?makerCheckerable=${makerCheckerable}`)
            .pipe(
                tap((list) => this.permissions.set(list)),
                catchError((err) => {
                    this.error.set(err.message || 'Failed to load permissions');
                    return of([]);
                }),
                tap(() => this.loading.set(false))
            )
            .subscribe();
    }

    // Update MakerChecker permissions
    updateMakerChecker(permissions: Record<string, boolean>) {
        const body = { permissions };
        return this.http
            .put(`${this.baseUrl}`, body)
            .pipe(tap(() => this.getPermissions(true)));
    }
}
