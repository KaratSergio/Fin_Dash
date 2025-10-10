import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, catchError, of } from 'rxjs';

export interface Charge {
    id: number;
    name: string;
    chargeTimeType: { id: number; value: string };
    chargeCalculationType?: { id: number; value: string };
    currency?: {
        code: string;
        name: string;
        displaySymbol?: string;
    };
    amount: number;
    penalty: boolean;
    status: string;
    chargeType: 'FEE' | 'PENALTY';
}

export interface ChargePayload {
    active: boolean;
    amount: number;
    chargeAppliesTo: number;
    chargeCalculationType: number;
    chargePaymentMode: number;
    chargeTimeType: number;
    currencyCode: string;
    enablePaymentType: boolean;
    feeFrequency?: string;
    feeInterval?: string;
    feeOnMonthDay?: string;
    locale: string;
    maxCap?: number;
    minCap?: number;
    monthDayFormat?: string;
    name: string;
    paymentTypeId?: number;
    penalty: boolean;
    taxGroupId?: number;
}

export interface ChargeTemplate {
    chargeTimeTypeOptions: Array<{ id: number; value: string }>;
    chargeCalculationTypeOptions: Array<{ id: number; value: string }>;
    currencyOptions: Array<{ code: string; name: string }>;
}

@Injectable({ providedIn: 'root' })
export class ChargesService {
    private http = inject(HttpClient);
    private baseUrl = 'api/fineract/charges';

    charges = signal<Charge[]>([]);
    loading = signal(false);
    error = signal<string | null>(null);

    // Fetch all charges
    private fetchCharges() {
        this.loading.set(true);
        this.http
            .get<Charge[]>(this.baseUrl)
            .pipe(tap(list => this.charges.set(list)),
                catchError(err => {
                    this.error.set(err.message || 'Failed to load charges');
                    return of([]);
                }),
                tap(() => this.loading.set(false))
            ).subscribe();
    }

    // Get charges list
    getCharges() {
        this.fetchCharges();
    }

    // Get single charge
    getCharge(chargeId: number) {
        return this.http
            .get<Charge>(`${this.baseUrl}/${chargeId}`);
    }

    // Create charge
    createCharge(data: { name: string; amount: number; currencyCode: string; penalty: boolean }) {
        const payload: ChargePayload = {
            active: true,
            amount: data.amount,
            chargeAppliesTo: 1, // Loans
            chargeCalculationType: 1,
            chargePaymentMode: 1,
            chargeTimeType: 1,
            currencyCode: data.currencyCode,
            enablePaymentType: true,
            locale: 'en',
            name: data.name,
            penalty: data.penalty
            // taxGroupId: 1;
        };
        return this.http
            .post<Charge>(this.baseUrl, payload)
            .pipe(tap(() => this.fetchCharges()));
    }

    // Update charge
    updateCharge(chargeId: number, data: { name: string; amount: number; currencyCode: string; penalty: boolean }) {
        const payload: ChargePayload = {
            active: true,
            amount: data.amount,
            chargeAppliesTo: 1,
            chargeCalculationType: 1,
            chargePaymentMode: 1,
            chargeTimeType: 1,
            currencyCode: data.currencyCode,
            enablePaymentType: true,
            locale: 'en',
            name: data.name,
            penalty: data.penalty
            // taxGroupId: 1;
        };
        return this.http
            .put<Charge>(`${this.baseUrl}/${chargeId}`, payload)
            .pipe(tap(() => this.fetchCharges()));
    }

    // Delete charge
    deleteCharge(chargeId: number) {
        return this.http
            .delete<void>(`${this.baseUrl}/${chargeId}`)
            .pipe(tap(() => this.fetchCharges()));
    }

    // Get template for creating charge
    getChargeTemplate() {
        return this.http
            .get<ChargeTemplate>(`${this.baseUrl}/template`);
    }
}
