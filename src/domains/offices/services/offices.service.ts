import { Injectable, signal, inject, computed, effect } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { tap, catchError, of, switchMap, startWith, firstValueFrom } from 'rxjs';
import { formatDateForApi } from '@core/utils/date';
import { APP_DEFAULTS } from '@core/constants/app.constants';
import { AppError, handleError } from '@core/utils/error';

import { Office } from '../interfaces/office.interface';
import { CreateOfficeDto, UpdateOfficeDto, OfficeQueryDto } from '../interfaces/office.dto';

@Injectable({ providedIn: 'root' })
export class OfficesService {
  private http = inject(HttpClient);
  private baseUrl = '/api/fineract/offices';

  readonly offices = signal<Office[]>([]);
  readonly total = computed(() => this.offices().length);
  readonly loading = signal(false);
  readonly error = signal<AppError | null>(null);
  private readonly reload = signal(0);
  private readonly queryParams = signal<OfficeQueryDto | undefined>(undefined);

  // Template signal
  readonly template = toSignal(
    this.http.get<Office>(`${this.baseUrl}/template`).pipe(
      catchError((err) => {
        this.error.set(err.message || 'Failed to load office template');
        return of(null);
      })
    ),
    { initialValue: null }
  );

  // Single loader that handles both cases - with and without params
  private officesLoader = toSignal(
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
            if (value !== null) httpParams = httpParams.set(key, value.toString());
          });
        }

        return this.http.get<Office[]>(this.baseUrl, { params: httpParams }).pipe(
          tap((list) => this.offices.set(list)),
          catchError((err) => {
            this.error.set(err.message || 'Failed to load offices');
            return of([]);
          })
        );
      }),
      tap(() => this.loading.set(false))
    ),
    { initialValue: [] }
  );

  // log errors
  private logErrors = effect(() => {
    const err = this.error();
    if (err) console.warn('[OfficesService]', err);
  });

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
        openingDate: formatDateForApi(data.openingDate),
      };

      await firstValueFrom(this.http.post<Office>(this.baseUrl, payload));
      this.refresh();
    } catch (err) {
      this.error.set(handleError(err, 'Failed to create office'));
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
      this.refresh();
    } catch (err) {
      this.error.set(handleError(err, 'Failed to update office'));
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
      this.refresh();
    } catch (err) {
      this.error.set(handleError(err, 'Failed to upload office template'));
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
      this.error.set(handleError(err, 'Failed to get office by external ID'));
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
      this.refresh();
    } catch (err) {
      this.error.set(handleError(err, 'Failed to update office by external ID'));
    } finally {
      this.loading.set(false);
    }
  }
}