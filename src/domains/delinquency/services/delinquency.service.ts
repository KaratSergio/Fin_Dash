import { Injectable, signal, inject, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { tap, catchError, of, startWith, switchMap, firstValueFrom } from 'rxjs';
import { AppError, handleError } from '@core/utils/error';
import { DelinquencyRange, DelinquencyBucket } from '../interfaces/delinquency.interface';

@Injectable({ providedIn: 'root' })
export class DelinquencyService {
  private http = inject(HttpClient);
  private baseUrl = 'api/fineract/delinquency';

  // signals
  readonly ranges = signal<DelinquencyRange[]>([]);
  readonly buckets = signal<DelinquencyBucket[]>([]);
  readonly loading = signal(false);
  readonly error = signal<AppError | null>(null);
  private readonly reload = signal(0);

  // loader for ranges and buckets
  private delinquencyLoader = toSignal(
    toObservable(this.reload).pipe(
      startWith(0),
      tap(() => {
        this.loading.set(true);
        this.error.set(null);
      }),
      switchMap(() =>
        this.http.get<{ ranges: DelinquencyRange[]; buckets: DelinquencyBucket[] }>(this.baseUrl).pipe(
          tap((res) => {
            this.ranges.set(res.ranges || []);
            this.buckets.set(res.buckets || []);
          }),
          catchError((err) => {
            this.error.set(err.message || 'Failed to load delinquency data');
            return of({ ranges: [], buckets: [] });
          })
        )
      ),
      tap(() => this.loading.set(false))
    ),
    { initialValue: null }
  );

  // log errors
  private logErrors = effect(() => {
    const err = this.error();
    if (err) console.warn('[DelinquencyService]', err);
  });

  // trigger reload
  refresh() {
    this.reload.update((n) => n + 1);
  }

  // CRUD Ranges
  async createRange(range: Partial<DelinquencyRange>) {
    this.loading.set(true)
    try {
      await firstValueFrom(this.http.post<DelinquencyRange>(`${this.baseUrl}/ranges`, range));
      this.refresh();
    } catch (err) {
      this.error.set(handleError(err, 'Failed to create range'));
    } finally {
      this.loading.set(false)
    }
  }

  async updateRange(id: number, range: Partial<DelinquencyRange>) {
    this.loading.set(true);
    try {
      await firstValueFrom(this.http.put<DelinquencyRange>(`${this.baseUrl}/ranges/${id}`, range));
      this.refresh();
    } catch (err) {
      this.error.set(handleError(err, 'Failed to update range'));
    } finally {
      this.loading.set(false);
    }
  }

  async deleteRange(id: number) {
    this.loading.set(true);
    try {
      await firstValueFrom(this.http.delete<void>(`${this.baseUrl}/ranges/${id}`));
      this.refresh();
    } catch (err) {
      this.error.set(handleError(err, 'Failed to delete range'));
    } finally {
      this.loading.set(false);
    }
  }

  // CRUD Buckets
  async createBucket(bucket: Partial<DelinquencyBucket>) {
    this.loading.set(true);
    try {
      await firstValueFrom(this.http.post<DelinquencyBucket>(`${this.baseUrl}/buckets`, bucket));
      this.refresh();
    } catch (err) {
      this.error.set(handleError(err, 'Failed to create bucket'));
    } finally {
      this.loading.set(false);
    }
  }

  async updateBucket(id: number, bucket: Partial<DelinquencyBucket>) {
    this.loading.set(true);
    try {
      await firstValueFrom(this.http.put<DelinquencyBucket>(`${this.baseUrl}/buckets/${id}`, bucket));
      this.refresh();
    } catch (err) {
      this.error.set(handleError(err, 'Failed to update bucket'));
    } finally {
      this.loading.set(false);
    }
  }

  async deleteBucket(id: number) {
    this.loading.set(true);
    try {
      await firstValueFrom(this.http.delete<void>(`${this.baseUrl}/buckets/${id}`));
      this.refresh();
    } catch (err) {
      this.error.set(handleError(err, 'Failed to delete bucket'));
    } finally {
      this.loading.set(false);
    }
  }
}
