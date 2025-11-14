import { Injectable, signal, inject, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { tap, catchError, of, switchMap, startWith, firstValueFrom } from 'rxjs';

import type { Charge, ChargeTemplate } from '../interfaces/charge.interface';
import type { ChargeCreateDto, ChargeUpdateDto, ChargeBaseFields } from '../interfaces/charge.dto';

import { NotificationService } from '@core/services/notification/notification.service';
import { CHARGES_NOTIFICATION_MESSAGES as MSG } from '@core/constants/notifications/charge-messages.const';

@Injectable({ providedIn: 'root' })
export class ChargesService {
  private http = inject(HttpClient);
  private notificationService = inject(NotificationService);
  private baseUrl = 'api/fineract/charges';

  readonly charges = signal<Charge[]>([]);
  readonly total = computed(() => this.charges().length)
  readonly loading = signal(false);
  private readonly reload = signal(0);

  // Get template
  readonly template = toSignal(
    this.http.get<ChargeTemplate>(`${this.baseUrl}/template`).pipe(
      catchError((err) => {
        this.notificationService.error(MSG.ERROR.TEMPLATE_LOAD);
        return of(null);
      })
    ),
    { initialValue: null }
  );

  // automatically re-fetch charges when reload changes
  private chargesLoader = toSignal(
    toObservable(this.reload).pipe(
      startWith(0),
      tap(() => this.loading.set(true)),
      switchMap(() =>
        this.http.get<Charge[]>(this.baseUrl).pipe(
          tap((list) => this.charges.set(list)),
          catchError((err) => {
            this.notificationService.error(MSG.ERROR.LOAD);
            return of([]);
          })
        )
      ),
      tap(() => this.loading.set(false))
    ),
    { initialValue: [] }
  );

  // trigger reload
  refresh() {
    this.reload.update((n) => n + 1);
  }

  // CRUD
  async createCharge(data: Pick<ChargeBaseFields, 'name' | 'amount' | 'currencyCode' | 'penalty'>) {
    this.loading.set(true);

    try {
      const payload: ChargeCreateDto = {
        active: true,
        chargeAppliesTo: 1,
        chargeCalculationType: 1,
        chargePaymentMode: 1,
        chargeTimeType: 1,
        enablePaymentType: true,
        locale: 'en',
        ...data,
        // taxGroupId: 1,
      };

      await firstValueFrom(this.http.post<Charge>(this.baseUrl, payload))
      this.notificationService.success(MSG.SUCCESS.CREATED);
      this.refresh()
    } catch (err) {
      this.notificationService.error(MSG.ERROR.CREATE);
    } finally {
      this.loading.set(false);
    }
  }

  async updateCharge(chargeId: number, data: ChargeUpdateDto) {
    this.loading.set(true);

    try {
      const payload: ChargeUpdateDto = {
        active: true,
        chargeAppliesTo: 1,
        chargeCalculationType: 1,
        chargePaymentMode: 1,
        chargeTimeType: 1,
        enablePaymentType: true,
        locale: 'en',
        ...data,
        // taxGroupId: 1,
      };

      await firstValueFrom(this.http.put<Charge>(`${this.baseUrl}/${chargeId}`, payload));
      this.notificationService.success(MSG.SUCCESS.UPDATED);
      this.refresh()
    } catch (err) {
      this.notificationService.error(MSG.ERROR.UPDATE);
    } finally {
      this.loading.set(false)
    }
  }

  async deleteCharge(chargeId: number) {
    this.loading.set(true);

    try {
      await firstValueFrom(this.http.delete<void>(`${this.baseUrl}/${chargeId}`));
      this.notificationService.success(MSG.SUCCESS.DELETED);
      this.refresh();
    } catch (err) {
      this.notificationService.error(MSG.ERROR.DELETE);
    } finally {
      this.loading.set(false);
    };
  }

  // get single charge
  getCharge(chargeId: number) {
    return this.http.get<Charge>(`${this.baseUrl}/${chargeId}`);
  }
}