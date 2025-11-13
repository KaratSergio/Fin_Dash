import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { tap, catchError, of, startWith, switchMap, firstValueFrom } from 'rxjs';

import type { Client } from '../interfaces/client.interface';
import type { ClientQueryParams, ClientsResponse, CreateClientDto, UpdateClientDto, TransferClientDto } from '../interfaces/client.dto';

import { NotificationService } from '@core/services/notification/notification.service';
import { CLIENT_NOTIFICATION_MESSAGES as MSG } from '@core/constants/notifications/client-messages.const';
import { genId } from '@core/utils';

@Injectable({ providedIn: 'root' })
export class ClientsService {
  private http = inject(HttpClient);
  private notificationService = inject(NotificationService);
  private baseUrl = 'api/fineract/clients';

  readonly clients = signal<Client[]>([]);
  readonly loading = signal(false);
  private readonly reload = signal(0);
  private readonly queryParams = signal<ClientQueryParams | undefined>(undefined);

  // loader
  private clientsLoader = toSignal(
    toObservable(this.reload).pipe(
      startWith(0),
      tap(() => this.loading.set(true)),
      switchMap(() => {
        let httpParams = new HttpParams();
        const params = this.queryParams();

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
            this.notificationService.error(MSG.ERROR.LOAD);
            return of({ pageItems: [] as Client[], totalFilteredRecords: 0 });
          })
        );
      }),
      tap(() => this.loading.set(false))
    ),
    { initialValue: { pageItems: [] as Client[], totalFilteredRecords: 0 } }
  );

  // refresh loader
  refresh() {
    this.reload.update((n) => n + 1);
  }

  // Set query parameters
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
  async createClient(client: CreateClientDto) {
    this.loading.set(true);
    const payload = {
      ...client,
      externalId: genId(8),
    }
    try {
      await firstValueFrom(this.http.post<Client>(this.baseUrl, payload));
      this.notificationService.success(MSG.SUCCESS.CREATED);
      this.refresh();
    } catch (err) {
      this.notificationService.error(MSG.ERROR.CREATE);
    } finally {
      this.loading.set(false);
    }
  }

  async updateClient(clientId: number, client: UpdateClientDto) {
    this.loading.set(true);
    try {
      await firstValueFrom(this.http.put<Client>(`${this.baseUrl}/${clientId}`, client));
      this.notificationService.success(MSG.SUCCESS.UPDATED);
      this.refresh();
    } catch (err) {
      this.notificationService.error(MSG.ERROR.UPDATE);
    } finally {
      this.loading.set(false);
    }
  }

  async deleteClient(clientId: number) {
    this.loading.set(true);
    try {
      await firstValueFrom(this.http.delete<void>(`${this.baseUrl}/${clientId}`));
      this.notificationService.success(MSG.SUCCESS.DELETED);
      this.refresh();
    } catch (err) {
      this.notificationService.error(MSG.ERROR.DELETE);
    } finally {
      this.loading.set(false);
    }
  }

  async activateClient(clientId: number) {
    try {
      await firstValueFrom(this.http.post<void>(`${this.baseUrl}/${clientId}?command=activate`, {}));
      this.notificationService.success(MSG.SUCCESS.ACTIVATED);
      this.refresh();
    } catch (err) {
      this.notificationService.error(MSG.ERROR.ACTIVATE);
    }
  }

  async deactivateClient(clientId: number) {
    try {
      await firstValueFrom(this.http.post<void>(`${this.baseUrl}/${clientId}?command=deactivate`, {}));
      this.notificationService.success(MSG.SUCCESS.DEACTIVATED);
      this.refresh();
    } catch (err) {
      this.notificationService.error(MSG.ERROR.DEACTIVATE);
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
      this.notificationService.success(MSG.SUCCESS.TRANSFER_PROPOSED);
      this.refresh();
    } catch (err) {
      this.notificationService.error(MSG.ERROR.TRANSFER_PROPOSE);
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
      this.notificationService.success(MSG.SUCCESS.TRANSFER_ACCEPTED);
      this.refresh();
    } catch (err) {
      this.notificationService.error(MSG.ERROR.TRANSFER_ACCEPT);
    } finally {
      this.loading.set(false);
    }
  }

  async transferClientWithdraw(clientId: number) {
    try {
      await firstValueFrom(
        this.http.post(`${this.baseUrl}/${clientId}?command=withdrawTransfer`, {})
      );
      this.notificationService.success(MSG.SUCCESS.TRANSFER_WITHDRAWN);
      this.refresh();
    } catch (err) {
      this.notificationService.error(MSG.ERROR.TRANSFER_WITHDRAW);
    }
  }

  async transferClientReject(clientId: number) {
    try {
      await firstValueFrom(
        this.http.post(`${this.baseUrl}/${clientId}?command=rejectTransfer`, {})
      );
      this.notificationService.success(MSG.SUCCESS.TRANSFER_REJECTED);
      this.refresh();
    } catch (err) {
      this.notificationService.error(MSG.ERROR.TRANSFER_REJECT);
    }
  }
}