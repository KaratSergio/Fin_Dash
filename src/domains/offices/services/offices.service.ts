import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { tap, catchError, of } from 'rxjs';
import { formatDateForApi } from '@core/utils/date';
import { APP_DEFAULTS } from '@core/constants/app.constants';

import { Office } from '../interfaces/office.interface';
import { CreateOfficeDto, UpdateOfficeDto, OfficeQueryDto } from '../interfaces/office.dto';

@Injectable({ providedIn: 'root' })
export class OfficesService {
    private http = inject(HttpClient);
    private baseUrl = '/api/fineract/offices';

    offices = signal<Office[]>([]);
    loading = signal(false);
    error = signal<string | null>(null);

    // fetch offices by params
    private fetchOffices(params?: OfficeQueryDto) {
        this.loading.set(true);

        let httpParams = new HttpParams();

        if (params) {
            Object.entries(params).forEach(([k, v]) => {
                if (v !== null) httpParams = httpParams.set(k, v.toString());
            });
        }

        this.http.get<Office[]>(this.baseUrl, { params: httpParams })
            .pipe(
                tap(list => this.offices.set(list)),
                catchError(err => {
                    this.error.set(err.message || 'Failed to load offices');
                    return of([]);
                }),
                tap(() => this.loading.set(false))
            ).subscribe();
    }

    // CRUD
    // Get all offices list
    getOffices(params?: OfficeQueryDto) {
        this.fetchOffices(params);
    }

    // Get office by ID
    getOffice(officeId: number) {
        return this.http.get<Office>(`${this.baseUrl}/${officeId}`);
    }

    // Create new office
    createOffice(office: CreateOfficeDto) {
        const payload = {
            ...office,
            openingDate: formatDateForApi(office.openingDate)
        };

        return this.http
            .post<Office>(this.baseUrl, payload)
            .pipe(tap(() => this.fetchOffices()));
    }

    // Update office by ID
    updateOffice(officeId: number, office: UpdateOfficeDto) {
        const payload: UpdateOfficeDto = {
            ...office,
            openingDate: office.openingDate
                ? formatDateForApi(office.openingDate)
                : undefined,
            dateFormat: office.dateFormat ?? APP_DEFAULTS.DATE_FORMAT,
            locale: office.locale ?? APP_DEFAULTS.LOCALE
        }

        return this.http
            .put<Office>(`${this.baseUrl}/${officeId}`, payload)
            .pipe(tap(() => this.fetchOffices()));
    }

    // TEMPLATE
    // Get office template
    getTemplate() {
        return this.http.get<Office>(`${this.baseUrl}/template`);
    }

    // Upload office template
    uploadTemplate(file: File) {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post<void>(`${this.baseUrl}/uploadtemplate`, formData)
            .pipe(tap(() => this.fetchOffices()));
    }


    // EXTERNAL ID
    // Get an office using an external ID
    getByExternalId(externalId: string) {
        return this.http.get<Office>(`${this.baseUrl}/external-id/${externalId}`);
    }

    // Update an office using an external ID
    updateByExternalId(externalId: string, office: Partial<Office>) {
        return this.http
            .put<Office>(`${this.baseUrl}/external-id/${externalId}`, office)
            .pipe(tap(() => this.fetchOffices()));
    }
}
