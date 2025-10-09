import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, catchError, of } from 'rxjs';

export interface Charge {
    id: number;                       // Charge ID
    name: string;                     // Name of the charge
    description: string;              // Description of the charge (optional)
    chargeTimeType: {                 // Type of charge timing
        id: number;                   // Timing type ID
        value: string;                // Timing type value/label
    };
    chargeCalculationType?: {         // Optional calculation type
        id: number;                   // Calculation type ID
        value: string;                // Calculation type value/label
    };
    currencyCode: string;             // Currency code, e.g. USD
    amount: number;                   // Charge amount
    penalty: boolean;                 // Is this a penalty?
    status: string;                   // Status of the charge
    chargeType: 'FEE' | 'PENALTY';    // Type of charge (FEE or PENALTY)
}


export interface ChargeTemplate {
    chargeTimeTypes: Array<{ id: number; value: string }>;
    chargeCalculationTypes: Array<{ id: number; value: string }>;
    currencies: Array<{ code: string; name: string }>;
}

@Injectable({ providedIn: 'root' })
export class ChargesService {
    private http = inject(HttpClient);
    private baseUrl = 'api/fineract/charges';

    charges = signal<Charge[]>([]);
    loading = signal(false);
    error = signal<string | null>(null);

    // Private fetch method
    private fetchCharges() {
        this.loading.set(true);
        this.http.get<Charge[]>(this.baseUrl).pipe(
            tap(list => this.charges.set(list)),
            catchError(err => {
                this.error.set(err.message || 'Failed to load charges');
                return of([]);
            }),
            tap(() => this.loading.set(false))
        ).subscribe();
    }

    // CRUD
    getCharges() {
        this.fetchCharges();
    }

    getCharge(chargeId: number) {
        return this.http.get<Charge>(`${this.baseUrl}/${chargeId}`);
    }

    createCharge(charge: Partial<Charge>) {
        return this.http.post<Charge>(this.baseUrl, charge).pipe(
            tap(() => this.fetchCharges())
        );
    }

    updateCharge(chargeId: number, charge: Partial<Charge>) {
        return this.http.put<Charge>(`${this.baseUrl}/${chargeId}`, charge).pipe(
            tap(() => this.fetchCharges())
        );
    }

    deleteCharge(chargeId: number) {
        return this.http.delete<void>(`${this.baseUrl}/${chargeId}`).pipe(
            tap(() => this.fetchCharges())
        );
    }

    getChargeTemplate() {
        return this.http.get<ChargeTemplate>(`${this.baseUrl}/template`);
    }
}
