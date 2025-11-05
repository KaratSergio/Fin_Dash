import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of, tap } from 'rxjs';
import type { LoanProduct } from '../interfaces/loan-product.interface';
import type { LoanProductCreateDto, LoanProductUpdateDto } from '../interfaces/dto/loan-product.dto';

// A Loan product is a template that is used when creating a loan.
// Much of the template definition can be overridden during loan creation.

@Injectable({ providedIn: 'root' })
export class LoanProductsService {
  private http = inject(HttpClient);
  private baseUrl = 'api/fineract/loanproducts';

  loanProducts = signal<LoanProduct[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  // Get loan product list
  getLoanProducts() {
    this.loading.set(true);
    this.http
      .get<{ pageItems: LoanProduct[] } | LoanProduct[]>(this.baseUrl)
      .pipe(
        tap((res: any) => {
          const items = Array.isArray(res) ? res : res.pageItems || [];
          this.loanProducts.set(items);
        }),
        catchError((err) => {
          this.error.set(err.message || 'Failed to load loan products');
          return of({ pageItems: [] });
        }),
        tap(() => this.loading.set(false)),
      )
      .subscribe();
  }

  // CRUD
  // Get loan product by ID
  getLoanProductById(productId: number) {
    return this.http.get<LoanProduct>(`${this.baseUrl}/${productId}`);
  }

  // Get loan product by externalId
  getLoanProductByExternalId(externalId: string) {
    return this.http.get<LoanProduct>(`${this.baseUrl}/external-id/${externalId}`);
  }

  // Create loan product
  createLoanProduct(dto: LoanProductCreateDto) {
    return this.http.post<LoanProduct>(this.baseUrl, dto).pipe(tap(() => this.getLoanProducts()));
  }

  // Update loan product
  updateLoanProduct(productId: number, dto: LoanProductUpdateDto) {
    return this.http
      .put<LoanProduct>(`${this.baseUrl}/${productId}`, dto)
      .pipe(tap(() => this.getLoanProducts()));
  }

  // Update loan product by externalId
  updateLoanProductByExternalId(externalId: string, dto: LoanProductUpdateDto) {
    return this.http
      .put<LoanProduct>(`${this.baseUrl}/external-id/${externalId}`, dto)
      .pipe(tap(() => this.getLoanProducts()));
  }

  // get template
  getLoanProductTemplate() {
    return this.http.get(`${this.baseUrl}/template`);
  }
}
