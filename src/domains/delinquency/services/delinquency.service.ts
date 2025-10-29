import { Injectable, signal, inject, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { tap, catchError, of, startWith, switchMap } from 'rxjs';
import { AppError } from '@core/utils/error';
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
  createRange(range: Partial<DelinquencyRange>) {
    return this.http.post<DelinquencyRange>(`${this.baseUrl}/ranges`, range).pipe(
      tap(() => this.refresh()),
      catchError((err) => {
        this.error.set(err.message || 'Failed to create range');
        return of(null);
      })
    );
  }

  updateRange(id: number, range: Partial<DelinquencyRange>) {
    return this.http.put<DelinquencyRange>(`${this.baseUrl}/ranges/${id}`, range).pipe(
      tap(() => this.refresh()),
      catchError((err) => {
        this.error.set(err.message || 'Failed to update range');
        return of(null);
      })
    );
  }

  deleteRange(id: number) {
    return this.http.delete<void>(`${this.baseUrl}/ranges/${id}`).pipe(
      tap(() => this.refresh()),
      catchError((err) => {
        this.error.set(err.message || 'Failed to delete range');
        return of(null);
      })
    );
  }

  // CRUD Buckets
  createBucket(bucket: Partial<DelinquencyBucket>) {
    return this.http.post<DelinquencyBucket>(`${this.baseUrl}/buckets`, bucket).pipe(
      tap(() => this.refresh()),
      catchError((err) => {
        this.error.set(err.message || 'Failed to create bucket');
        return of(null);
      })
    );
  }

  updateBucket(id: number, bucket: Partial<DelinquencyBucket>) {
    return this.http.put<DelinquencyBucket>(`${this.baseUrl}/buckets/${id}`, bucket).pipe(
      tap(() => this.refresh()),
      catchError((err) => {
        this.error.set(err.message || 'Failed to update bucket');
        return of(null);
      })
    );
  }

  deleteBucket(id: number) {
    return this.http.delete<void>(`${this.baseUrl}/buckets/${id}`).pipe(
      tap(() => this.refresh()),
      catchError((err) => {
        this.error.set(err.message || 'Failed to delete bucket');
        return of(null);
      })
    );
  }
}
