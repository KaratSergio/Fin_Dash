import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { tap, catchError, of, switchMap, startWith, firstValueFrom } from 'rxjs';

import type { Office } from '../interfaces/office.interface';
import type { CreateOfficeDto, UpdateOfficeDto, OfficeQueryDto } from '../interfaces/office.dto';
import { formatDateForApi, genId } from '@core/utils';
import { APP_DEFAULTS } from '@core/constants/app.constants';
import { NotificationService } from '@core/services/notification/notification.service';
import { OFFICE_NOTIFICATION_MESSAGES as MSG } from '../constants/notification-messages.const';

@Injectable({ providedIn: 'root' })
export class OfficesService {
  private http = inject(HttpClient);
  private notificationService = inject(NotificationService);
  private baseUrl = '/api/fineract/offices';

  readonly offices = signal<Office[]>([]);
  readonly total = computed(() => this.offices().length);
  readonly loading = signal(false);
  private readonly reload = signal(0);
  private readonly queryParams = signal<OfficeQueryDto | undefined>(undefined);

  // Template signal
  readonly template = toSignal(
    this.http.get<Office>(`${this.baseUrl}/template`).pipe(
      catchError((err) => {
        this.notificationService.error(MSG.ERROR.LOAD_TEMPLATE);
        return of(null);
      })
    ),
    { initialValue: null }
  );

  // Offices loader
  private officesLoader = toSignal(
    toObservable(computed(() => ({ reload: this.reload(), params: this.queryParams() }))).pipe(
      startWith({ reload: 0, params: undefined }),
      tap(() => this.loading.set(true)),
      switchMap(({ params }) => {
        let httpParams = new HttpParams();
        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            if (value !== null) httpParams = httpParams.set(key, value.toString());
          });
        }

        return this.http.get<Office[]>(this.baseUrl, { params: httpParams }).pipe(
          tap((list) => this.offices.set(list)),
          catchError((err) => {
            this.notificationService.error(MSG.ERROR.LOAD);
            return of([]);
          })
        );
      }),
      tap(() => this.loading.set(false))
    ),
    { initialValue: [] }
  );

  // trigger reload
  refresh() {
    this.reload.update((n) => n + 1);
  }

  // Set query parameters and trigger reload
  setQueryParams(params: OfficeQueryDto) {
    this.queryParams.set(params);
    this.refresh();
  }

  // Clear query parameters
  clearQueryParams() {
    this.queryParams.set(undefined);
    this.refresh();
  }

  // CRUD
  async createOffice(data: CreateOfficeDto) {
    this.loading.set(true);
    try {
      const payload = {
        ...data,
        externalId: genId(8),
        openingDate: formatDateForApi(data.openingDate),
      };

      await firstValueFrom(this.http.post<Office>(this.baseUrl, payload));
      this.notificationService.success(MSG.SUCCESS.CREATED);
      this.refresh();
    } catch (err) {
      this.notificationService.error(MSG.ERROR.CREATE);
    } finally {
      this.loading.set(false);
    }
  }

  async updateOffice(officeId: number, data: UpdateOfficeDto) {
    this.loading.set(true);
    try {
      const payload: UpdateOfficeDto = {
        ...data,
        openingDate: data.openingDate ? formatDateForApi(data.openingDate) : undefined,
        dateFormat: data.dateFormat ?? APP_DEFAULTS.DATE_FORMAT,
        locale: data.locale ?? APP_DEFAULTS.LOCALE,
      };

      await firstValueFrom(this.http.put<Office>(`${this.baseUrl}/${officeId}`, payload));
      this.notificationService.success(MSG.SUCCESS.UPDATED);
      this.refresh();
    } catch (err) {
      this.notificationService.error(MSG.ERROR.UPDATE);
    } finally {
      this.loading.set(false);
    }
  }

  // get single office
  getOffice(officeId: number) {
    return this.http.get<Office>(`${this.baseUrl}/${officeId}`);
  }

  // Template operations
  async uploadTemplate(file: File) {
    this.loading.set(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      await firstValueFrom(this.http.post<void>(`${this.baseUrl}/uploadtemplate`, formData));
      this.notificationService.success(MSG.SUCCESS.TEMPLATE_UPLOADED);
      this.refresh();
    } catch (err) {
      this.notificationService.error(MSG.ERROR.UPLOAD_TEMPLATE);
    } finally {
      this.loading.set(false);
    }
  }

  // External ID operations
  async getByExternalId(externalId: string) {
    this.loading.set(true);
    try {
      const office = await firstValueFrom(
        this.http.get<Office>(`${this.baseUrl}/external-id/${externalId}`)
      );
      return office;
    } catch (err) {
      this.notificationService.error(MSG.ERROR.GET_BY_EXTERNAL_ID);
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  async updateByExternalId(externalId: string, data: Partial<Office>) {
    this.loading.set(true);
    try {
      await firstValueFrom(
        this.http.put<Office>(`${this.baseUrl}/external-id/${externalId}`, data)
      );
      this.notificationService.success(MSG.SUCCESS.UPDATED_BY_EXTERNAL_ID);
      this.refresh();
    } catch (err) {
      this.notificationService.error(MSG.ERROR.UPDATE_BY_EXTERNAL_ID);
    } finally {
      this.loading.set(false);
    }
  }
}