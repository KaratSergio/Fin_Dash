import { Injectable, signal, inject, computed, effect } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { tap, catchError, of, switchMap, startWith, firstValueFrom } from 'rxjs';
import { AppError, handleError } from '@core/utils/error';
import { Client } from '../interfaces/client.interface';
import {
  CreateClientDto,
  UpdateClientDto,
  TransferClientDto,
  ClientQueryParams,
  ClientsResponse,
} from '../interfaces/client.dto';

@Injectable({ providedIn: 'root' })
export class ClientsService {
  private http = inject(HttpClient);
  private baseUrl = 'api/fineract/clients';

  readonly clients = signal<Client[]>([]);
  readonly total = computed(() => this.clients().length);
  readonly loading = signal(false);
  readonly error = signal<AppError | null>(null);
  private readonly reload = signal(0);
  private readonly queryParams = signal<ClientQueryParams | undefined>(undefined);

  // Single loader that handles both cases - with and without params
  private clientsLoader = toSignal(
    toObservable(computed(() => ({ reload: this.reload(), params: this.queryParams() }))).pipe(
      startWith({ reload: 0, params: undefined }),
      tap(() => {
        this.loading.set(true);
        this.error.set(null);
      }),
      switchMap(({ params }) => {
        let httpParams = new HttpParams();
        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            if (value != null) httpParams = httpParams.set(key, value.toString());
          });
        }

        return this.http.get<ClientsResponse>(this.baseUrl, { params: httpParams }).pipe(
          tap((response) => {
            this.clients.set(response.pageItems || []);
          }),
          catchError((err) => {
            this.error.set(err.message || 'Failed to load clients');
            return of({ pageItems: [] as Client[], totalFilteredRecords: 0 });
          })
        );
      }),
      tap(() => this.loading.set(false))
    ),
    { initialValue: { pageItems: [] as Client[], totalFilteredRecords: 0 } }
  );

  // log errors
  private logErrors = effect(() => {
    const err = this.error();
    if (err) console.warn('[ClientsService]', err);
  });

  // trigger reload
  refresh() {
    this.reload.update((n) => n + 1);
  }

  // Set query parameters and trigger reload
  setQueryParams(params: ClientQueryParams) {
    this.queryParams.set(params);
    this.refresh();
  }

  // Clear query parameters
  clearQueryParams() {
    this.queryParams.set(undefined);
    this.refresh();
  }

  // CRUD
  async createClient(data: CreateClientDto) {
    this.loading.set(true);

    try {
      await firstValueFrom(this.http.post<Client>(this.baseUrl, data));
      this.refresh();
    } catch (err) {
      this.error.set(handleError(err, 'Failed to create client'));
    } finally {
      this.loading.set(false);
    }
  }

  async updateClient(clientId: number, data: UpdateClientDto) {
    this.loading.set(true);

    try {
      await firstValueFrom(this.http.put<Client>(`${this.baseUrl}/${clientId}`, data));
      this.refresh();
    } catch (err) {
      this.error.set(handleError(err, 'Failed to update client'));
    } finally {
      this.loading.set(false);
    }
  }

  async deleteClient(clientId: number) {
    this.loading.set(true);

    try {
      await firstValueFrom(this.http.delete<void>(`${this.baseUrl}/${clientId}`));
      this.refresh();
    } catch (err) {
      this.error.set(handleError(err, 'Failed to delete client'));
    } finally {
      this.loading.set(false);
    }
  }

  // get single client
  getClient(clientId: number) {
    return this.http.get<Client>(`${this.baseUrl}/${clientId}`);
  }

  // Client transfer operations
  async transferClientPropose(clientId: number, destinationOfficeId: number) {
    this.loading.set(true);

    try {
      const payload: TransferClientDto = {
        destinationOfficeId,
        transferDate: new Date().toISOString().split('T')[0],
        dateFormat: 'yyyy-MM-dd',
        locale: 'en',
      };

      await firstValueFrom(
        this.http.post(`${this.baseUrl}/${clientId}?command=proposeTransfer`, payload)
      );
      this.refresh();
    } catch (err) {
      this.error.set(handleError(err, 'Failed to propose client transfer'));
    } finally {
      this.loading.set(false);
    }
  }

  async transferClientAccept(clientId: number, destinationOfficeId: number) {
    this.loading.set(true);

    try {
      const payload: TransferClientDto = {
        destinationOfficeId,
        transferDate: new Date().toISOString().split('T')[0],
        dateFormat: 'yyyy-MM-dd',
        locale: 'en',
      };

      await firstValueFrom(
        this.http.post(`${this.baseUrl}/${clientId}?command=acceptTransfer`, payload)
      );
      this.refresh();
    } catch (err) {
      this.error.set(handleError(err, 'Failed to accept client transfer'));
    } finally {
      this.loading.set(false);
    }
  }
}