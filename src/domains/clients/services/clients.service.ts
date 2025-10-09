import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { tap, catchError, of } from 'rxjs';

export interface Client {
    id: number;                // Client ID
    externalId: string;        // External system ID (optional)
    firstname: string;         // First name of the client
    lastname: string;          // Last name of the client
    displayName: string;       // Full display name (optional)
    mobileNo: string;          // Mobile phone number (optional)
    emailAddress: string;      // Email address (optional)
    officeId: number;          // Office ID the client belongs to
    officeName: string;        // Office name the client belongs to (optional)
    active: boolean;           // Is client active? (optional)
    activationDate: string;    // Date when client was activated (yyyy-MM-dd) (optional)
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

        this.http
            .get<{ pageItems: Client[]; totalFilteredRecords: number }>(this.baseUrl, { params: httpParams })
            .pipe(tap(res => this.clients.set(res.pageItems)),

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
        return this.http
            .get<Client>(`${this.baseUrl}/${id}`);
    }

    // Create client
    createClient(client: Partial<Client>) {
        return this.http
            .post<Client>(this.baseUrl, client)
            .pipe(tap(() => this.fetchClients()));
    }

    // Update client base data by ID
    updateClient(clientId: number, data: any) {
        const payload = {
            firstname: data.firstname,
            lastname: data.lastname,
            emailAddress: data.emailAddress,
            mobileNo: data.mobileNo,
            externalId: data.externalId,
        };

        return this.http
            .put(`${this.baseUrl}/${clientId}`, payload)
            .pipe(tap(() => this.fetchClients()));
    }


    // The endpoint for transferring a client between offices
    // occurs in two stages: 
    // submitting a transfer request (transferClientPropose)
    // and accepting the transfer request. (transferClientAccept)
    transferClientPropose(clientId: number, destinationOfficeId: number) {
        const payload = {
            destinationOfficeId,
            transferDate: new Date().toISOString().split("T")[0],
            dateFormat: "yyyy-MM-dd",
            locale: "en",
        };

        return this.http
            .post(`${this.baseUrl}/${clientId}?command=proposeTransfer`, payload)
            .pipe(tap(() => this.fetchClients()));
    }

    transferClientAccept(clientId: number, destinationOfficeId: number) {
        const payload = {
            destinationOfficeId,
            transferDate: new Date().toISOString().split("T")[0],
            dateFormat: "yyyy-MM-dd",
            locale: "en",
        };

        return this.http
            .post(`${this.baseUrl}/${clientId}?command=acceptTransfer`, payload);
    }

    // Removed  client
    deleteClient(id: number) {
        return this.http
            .delete<void>(`${this.baseUrl}/${id}`)
            .pipe(tap(() => this.fetchClients()));
    }
}
