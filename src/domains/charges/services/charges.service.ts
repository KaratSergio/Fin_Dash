import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Charge, ChargeTemplate } from '../interfaces/charge.interface';
import { ChargeCreateDto, ChargeUpdateDto, ChargeBaseFields } from '../interfaces/charge.dto';
import { handleError, AppError } from '@core/utils/error';

@Injectable({ providedIn: 'root' })
export class ChargesService {
  private http = inject(HttpClient);
  private baseUrl = 'api/fineract/charges';

  charges = signal<Charge[]>([]);
  loading = signal(false);
  error = signal<AppError | null>(null);

  // Get charges list
  async getCharges() {
    try {
      this.loading.set(true);
      const list = await firstValueFrom(this.http.get<Charge[]>(this.baseUrl));
      this.charges.set(list);
    } catch (err) {
      this.error.set(handleError(err, 'Failed to load charges'));
      this.charges.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  // Get single charge
  getCharge(chargeId: number) {
    return this.http.get<Charge>(`${this.baseUrl}/${chargeId}`);
  }

  // Create charge
  async createCharge(data: Pick<ChargeBaseFields, 'name' | 'amount' | 'currencyCode' | 'penalty'>) {
    const payload: ChargeCreateDto = {
      active: true,
      chargeAppliesTo: 1, // Loans
      chargeCalculationType: 1,
      chargePaymentMode: 1,
      chargeTimeType: 1,
      enablePaymentType: true,
      locale: 'en',
      ...data,
      // taxGroupId: 1
    };
    await firstValueFrom(this.http.post<Charge>(this.baseUrl, payload));
    await this.getCharges();
  }

  // Update charge
  async updateCharge(chargeId: number, data: ChargeUpdateDto) {
    const payload: ChargeUpdateDto = {
      active: true,
      chargeAppliesTo: 1,
      chargeCalculationType: 1,
      chargePaymentMode: 1,
      chargeTimeType: 1,
      enablePaymentType: true,
      locale: 'en',
      ...data,
      // taxGroupId: 1
    };
    await firstValueFrom(this.http.put<Charge>(`${this.baseUrl}/${chargeId}`, payload));
    await this.getCharges();
  }

  // Delete charge
  async deleteCharge(chargeId: number) {
    await firstValueFrom(this.http.delete<void>(`${this.baseUrl}/${chargeId}`));
    await this.getCharges();
  }

  // Get template for creating charge
  getChargeTemplate() {
    return this.http.get<ChargeTemplate>(`${this.baseUrl}/template`);
  }
}
