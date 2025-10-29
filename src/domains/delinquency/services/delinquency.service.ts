import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, catchError, of } from 'rxjs';

export interface DelinquencyRange {
  id: number;
  name: string;
  minDays: number;
  maxDays: number;
}

export interface DelinquencyBucket {
  id: number;
  name: string;
  ranges: DelinquencyRange[];
}

@Injectable({ providedIn: 'root' })
export class DelinquencyService {
  private http = inject(HttpClient);
  private baseUrl = 'api/fineract/delinquency';

  ranges = signal<DelinquencyRange[]>([]);
  buckets = signal<DelinquencyBucket[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  // Fetch all ranges
  getRanges() {
    this.loading.set(true);
    this.http
      .get<DelinquencyRange[]>(`${this.baseUrl}/ranges`)
      .pipe(
        tap((list) => this.ranges.set(list)),
        catchError((err) => {
          this.error.set(err.message || 'Failed to load ranges');
          return of([]);
        }),
        tap(() => this.loading.set(false)),
      )
      .subscribe();
  }

  // CRUD Ranges
  createRange(range: Partial<DelinquencyRange>) {
    return this.http
      .post<DelinquencyRange>(`${this.baseUrl}/ranges`, range)
      .pipe(tap(() => this.getRanges()));
  }

  updateRange(id: number, range: Partial<DelinquencyRange>) {
    return this.http
      .put<DelinquencyRange>(`${this.baseUrl}/ranges/${id}`, range)
      .pipe(tap(() => this.getRanges()));
  }

  deleteRange(id: number) {
    return this.http.delete<void>(`${this.baseUrl}/ranges/${id}`).pipe(tap(() => this.getRanges()));
  }

  // Fetch all buckets
  getBuckets() {
    this.loading.set(true);
    this.http
      .get<DelinquencyBucket[]>(`${this.baseUrl}/buckets`)
      .pipe(
        tap((list) => this.buckets.set(list)),
        catchError((err) => {
          this.error.set(err.message || 'Failed to load buckets');
          return of([]);
        }),
        tap(() => this.loading.set(false)),
      )
      .subscribe();
  }

  // CRUD Buckets
  createBucket(bucket: Partial<DelinquencyBucket>) {
    return this.http
      .post<DelinquencyBucket>(`${this.baseUrl}/buckets`, bucket)
      .pipe(tap(() => this.getBuckets()));
  }

  updateBucket(id: number, bucket: Partial<DelinquencyBucket>) {
    return this.http
      .put<DelinquencyBucket>(`${this.baseUrl}/buckets/${id}`, bucket)
      .pipe(tap(() => this.getBuckets()));
  }

  deleteBucket(id: number) {
    return this.http
      .delete<void>(`${this.baseUrl}/buckets/${id}`)
      .pipe(tap(() => this.getBuckets()));
  }
}
