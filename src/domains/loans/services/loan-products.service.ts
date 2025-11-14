import { Injectable, signal, inject, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { tap, catchError, of, switchMap, startWith, firstValueFrom } from 'rxjs';

import type { LoanProduct } from '../interfaces/loan-product.interface';
import type { LoanProductCreateDto, LoanProductUpdateDto } from '../interfaces/dto/loan-product.dto';

import { NotificationService } from '@core/services/notification/notification.service';
import { LOAN_PRODUCTS_NOTIFICATION_MESSAGES as MSG } from '@core/constants/notifications/loan-messages.const';

// A Loan product is a template that is used when creating a loan.
// Much of the template definition can be overridden during loan creation.

@Injectable({ providedIn: 'root' })
export class LoanProductsService {
  private http = inject(HttpClient);
  private notificationService = inject(NotificationService);
  private baseUrl = 'api/fineract/loanproducts';

  readonly loanProducts = signal<LoanProduct[]>([]);
  readonly total = computed(() => this.loanProducts().length);
  readonly loading = signal(false);
  private readonly reload = signal(0);

  // Template signal
  readonly template = toSignal(
    this.http.get(`${this.baseUrl}/template`).pipe(
      catchError((err) => {
        this.notificationService.error(MSG.ERROR.TEMPLATE_LOAD);
        return of(null);
      })
    ),
    { initialValue: null }
  );

  // automatically re-fetch loan products when reload changes
  private loanProductsLoader = toSignal(
    toObservable(this.reload).pipe(
      startWith(0),
      tap(() => this.loading.set(true)),
      switchMap(() =>
        this.http.get<{ pageItems: LoanProduct[] } | LoanProduct[]>(this.baseUrl).pipe(
          tap((res: any) => {
            const items = Array.isArray(res) ? res : res.pageItems || [];
            this.loanProducts.set(items);
          }),
          catchError((err) => {
            this.notificationService.error(MSG.ERROR.LOAD);
            return of({ pageItems: [] });
          })
        )
      ),
      tap(() => this.loading.set(false))
    ),
    { initialValue: { pageItems: [] } }
  );

  // trigger reload
  refresh() {
    this.reload.update((n) => n + 1);
  }

  // CRUD
  async createLoanProduct(data: LoanProductCreateDto) {
    this.loading.set(true);

    try {
      await firstValueFrom(this.http.post<LoanProduct>(this.baseUrl, data));
      this.notificationService.success(MSG.SUCCESS.CREATED);
      this.refresh();
    } catch (err) {
      this.notificationService.error(MSG.ERROR.CREATE);
    } finally {
      this.loading.set(false);
    }
  }

  async updateLoanProduct(productId: number, data: LoanProductUpdateDto) {
    this.loading.set(true);

    try {
      await firstValueFrom(
        this.http.put<LoanProduct>(`${this.baseUrl}/${productId}`, data)
      );
      this.notificationService.success(MSG.SUCCESS.UPDATED);
      this.refresh();
    } catch (err) {
      this.notificationService.error(MSG.ERROR.UPDATE);
    } finally {
      this.loading.set(false);
    }
  }

  async updateLoanProductByExternalId(externalId: string, data: LoanProductUpdateDto) {
    this.loading.set(true);

    try {
      await firstValueFrom(
        this.http.put<LoanProduct>(`${this.baseUrl}/external-id/${externalId}`, data)
      );
      this.notificationService.success(MSG.SUCCESS.UPDATED);
      this.refresh();
    } catch (err) {
      this.notificationService.error(MSG.ERROR.UPDATE);
    } finally {
      this.loading.set(false);
    }
  }

  // get single loan product
  getLoanProductById(productId: number) {
    return this.http.get<LoanProduct>(`${this.baseUrl}/${productId}`);
  }

  // get loan product by external ID
  getLoanProductByExternalId(externalId: string) {
    return this.http.get<LoanProduct>(`${this.baseUrl}/external-id/${externalId}`);
  }

  // get loan template
  getLoanProductTemplate() {
    return this.http.get(`${this.baseUrl}/template`);
  }
}