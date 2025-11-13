import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { tap, catchError, of, startWith, switchMap, firstValueFrom } from 'rxjs';

import { DelinquencyRange, DelinquencyBucket } from '@domains/delinquency/interfaces/delinquency.interface';
import { NotificationService } from '@core/services/notification/notification.service';
import { DELINQUENCY_NOTIFICATION_MESSAGES as MSG } from '@core/constants/notifications/delinquency-messages.const';

@Injectable({ providedIn: 'root' })
export class DelinquencyService {
  private http = inject(HttpClient);
  private notificationService = inject(NotificationService);
  private baseUrl = 'api/fineract/delinquency';

  // signals
  readonly ranges = signal<DelinquencyRange[]>([]);
  readonly buckets = signal<DelinquencyBucket[]>([]);
  readonly loading = signal(false);
  private readonly reload = signal(0);

  // loader for ranges and buckets
  private delinquencyLoader = toSignal(
    toObservable(this.reload).pipe(
      startWith(0),
      tap(() => this.loading.set(true)),
      switchMap(() =>
        this.http.get<{ ranges: DelinquencyRange[]; buckets: DelinquencyBucket[] }>(this.baseUrl).pipe(
          tap((res) => {
            this.ranges.set(res.ranges || []);
            this.buckets.set(res.buckets || []);
          }),
          catchError((err) => {
            this.notificationService.error(MSG.ERROR.LOAD);
            return of({ ranges: [], buckets: [] });
          })
        )
      ),
      tap(() => this.loading.set(false))
    ),
    { initialValue: null }
  );

  // trigger reload
  refresh() {
    this.reload.update((n) => n + 1);
  }

  // CRUD Ranges
  async createRange(range: Partial<DelinquencyRange>) {
    this.loading.set(true)
    try {
      await firstValueFrom(this.http.post<DelinquencyRange>(`${this.baseUrl}/ranges`, range));
      this.notificationService.success(MSG.SUCCESS.RANGE_CREATED);
      this.refresh();
    } catch (err) {
      this.notificationService.error(MSG.ERROR.RANGE_CREATE);
    } finally {
      this.loading.set(false)
    }
  }

  async updateRange(id: number, range: Partial<DelinquencyRange>) {
    this.loading.set(true);
    try {
      await firstValueFrom(this.http.put<DelinquencyRange>(`${this.baseUrl}/ranges/${id}`, range));
      this.notificationService.success(MSG.SUCCESS.RANGE_UPDATED);
      this.refresh();
    } catch (err) {
      this.notificationService.error(MSG.ERROR.RANGE_UPDATE);
    } finally {
      this.loading.set(false);
    }
  }

  async deleteRange(id: number) {
    this.loading.set(true);
    try {
      await firstValueFrom(this.http.delete<void>(`${this.baseUrl}/ranges/${id}`));
      this.notificationService.success(MSG.SUCCESS.RANGE_DELETED);
      this.refresh();
    } catch (err) {
      this.notificationService.error(MSG.ERROR.RANGE_DELETE);
    } finally {
      this.loading.set(false);
    }
  }

  // CRUD Buckets
  async createBucket(bucket: Partial<DelinquencyBucket>) {
    this.loading.set(true);
    try {
      await firstValueFrom(this.http.post<DelinquencyBucket>(`${this.baseUrl}/buckets`, bucket));
      this.notificationService.success(MSG.SUCCESS.BUCKET_CREATED);
      this.refresh();
    } catch (err) {
      this.notificationService.error(MSG.ERROR.BUCKET_CREATE);
    } finally {
      this.loading.set(false);
    }
  }

  async updateBucket(id: number, bucket: Partial<DelinquencyBucket>) {
    this.loading.set(true);
    try {
      await firstValueFrom(this.http.put<DelinquencyBucket>(`${this.baseUrl}/buckets/${id}`, bucket));
      this.notificationService.success(MSG.SUCCESS.BUCKET_UPDATED);
      this.refresh();
    } catch (err) {
      this.notificationService.error(MSG.ERROR.BUCKET_UPDATE);
    } finally {
      this.loading.set(false);
    }
  }

  async deleteBucket(id: number) {
    this.loading.set(true);
    try {
      await firstValueFrom(this.http.delete<void>(`${this.baseUrl}/buckets/${id}`));
      this.notificationService.success(MSG.SUCCESS.BUCKET_DELETED);
      this.refresh();
    } catch (err) {
      this.notificationService.error(MSG.ERROR.BUCKET_DELETE);
    } finally {
      this.loading.set(false);
    }
  }
}