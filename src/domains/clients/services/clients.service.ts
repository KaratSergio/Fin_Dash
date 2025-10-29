import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { tap, catchError, of } from 'rxjs';
import { Client } from '../Interfaces/client.interface';
import {
  CreateClientDto,
  UpdateClientDto,
  TransferClientDto,
  ClientQueryParams,
  ClientsResponse,
} from '../Interfaces/client.dto';

@Injectable({ providedIn: 'root' })
export class ClientsService {
  private http = inject(HttpClient);
  private baseUrl = 'api/fineract/clients';

  clients = signal<Client[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  // Fetch Clients
  private fetchClients(params?: ClientQueryParams) {
    this.loading.set(true);

    let httpParams = new HttpParams();

    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v != null) httpParams = httpParams.set(k, v.toString());
      });
    }

    this.http
      .get<ClientsResponse>(this.baseUrl, { params: httpParams })
      .pipe(
        tap((res) => this.clients.set(res.pageItems)),

        catchError((err) => {
          this.error.set(err.message || 'Failed to load clients');
          return of({ pageItems: [] as Client[], totalFilteredRecords: 0 });
        }),

        tap(() => this.loading.set(false)),
      )
      .subscribe();
  }

  // CRUD
  // Get all clients
  getClients() {
    this.fetchClients();
  }

  // Get client by ID
  getClient(id: number) {
    return this.http.get<Client>(`${this.baseUrl}/${id}`);
  }

  // Create client
  createClient(client: CreateClientDto) {
    return this.http.post<Client>(this.baseUrl, client).pipe(tap(() => this.fetchClients()));
  }

  // Update client base data by ID
  updateClient(clientId: number, payload: UpdateClientDto) {
    return this.http
      .put(`${this.baseUrl}/${clientId}`, payload)
      .pipe(tap(() => this.fetchClients()));
  }

  // Removed  client
  deleteClient(id: number) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(tap(() => this.fetchClients()));
  }

  // The endpoint for transferring a client between offices
  // occurs in two stages:
  // submitting a transfer request (transferClientPropose)
  // and accepting the transfer request. (transferClientAccept)
  transferClientPropose(clientId: number, destinationOfficeId: number) {
    const payload: TransferClientDto = {
      destinationOfficeId,
      transferDate: new Date().toISOString().split('T')[0],
      dateFormat: 'yyyy-MM-dd',
      locale: 'en',
    };

    return this.http
      .post(`${this.baseUrl}/${clientId}?command=proposeTransfer`, payload)
      .pipe(tap(() => this.fetchClients()));
  }

  transferClientAccept(clientId: number, destinationOfficeId: number) {
    const payload: TransferClientDto = {
      destinationOfficeId,
      transferDate: new Date().toISOString().split('T')[0],
      dateFormat: 'yyyy-MM-dd',
      locale: 'en',
    };

    return this.http.post(`${this.baseUrl}/${clientId}?command=acceptTransfer`, payload);
  }
}
