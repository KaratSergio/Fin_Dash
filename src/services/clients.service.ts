import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { tap, catchError, of } from 'rxjs';

export interface Client {
    id: number;
    externalId?: string;
    firstname: string;
    lastname: string;
    displayName?: string;
    mobileNo?: string;
    emailAddress?: string;
    officeId: number;
    officeName?: string;
    active?: boolean;
    activationDate?: string;
}

@Injectable({ providedIn: 'root' })
export class ClientsService {
    private http = inject(HttpClient);
    private baseUrl = 'api/fineract/clients';

    clients = signal<Client[]>([]);
    loading = signal(false);
    error = signal<string | null>(null);

    // Fetch Clients
    private fetchClients(params?: { offset?: number; limit?: number; orderBy?: string; sortOrder?: 'ASC' | 'DESC' }) {
        this.loading.set(true);

        let httpParams = new HttpParams();
        if (params) {
            Object.entries(params).forEach(([k, v]) => {
                if (v != null) httpParams = httpParams.set(k, v.toString());
            });
        }

        this.http.get<{ pageItems: Client[]; totalFilteredRecords: number }>(this.baseUrl, { params: httpParams }).pipe(
            tap(res => this.clients.set(res.pageItems)),
            catchError(err => {
                this.error.set(err.message || 'Failed to load clients');
                return of({ pageItems: [] as Client[], totalFilteredRecords: 0 });
            }),
            tap(() => this.loading.set(false))
        ).subscribe();
    }


    // Get all clients
    getClients() {
        this.fetchClients();
    }

    // Get client by ID
    getClient(id: number) {
        return this.http.get<Client>(`${this.baseUrl}/${id}`);
    }

    createClient(client: Partial<Client>) {
        return this.http.post<Client>(this.baseUrl, client).pipe(
            tap(() => this.fetchClients())
        );
    }

    updateClient(id: number, client: Partial<Client>) {
        const { id: _, officeName, ...payload } = client;
        return this.http.put<Client>(`${this.baseUrl}/${id}`, payload).pipe(
            tap(() => this.fetchClients())
        );
    }

    deleteClient(id: number) {
        return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
            tap(() => this.fetchClients())
        );
    }
}
