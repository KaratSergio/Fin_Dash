import { Component, inject, signal, effect } from "@angular/core";
import { RouterModule } from '@angular/router';
import { FormBuilder, FormControl } from '@angular/forms';
import { FormUtils } from "@core/utils/form";

import { ChargesService } from "../services/charges.service";
import { CurrenciesService } from "@domains/currencies/services/currencies.service";

import { ChargesForm } from "../components/charges-form/charges-form";
import { ChargesTable } from "../components/charges-table/charges-table";

@Component({
    selector: "app-charges-page",
    standalone: true,
    imports: [RouterModule, ChargesForm, ChargesTable],
    templateUrl: "./charges.html",
    styleUrls: ["./charges.scss"]
})
export class ChargesPage {
    private fb = inject(FormBuilder);
    private utils = new FormUtils(this.fb);

    chargesService = inject(ChargesService);
    currenciesService = inject(CurrenciesService);

    charges = this.chargesService.charges;
    // currencies = this.currenciesService.allCurrencies;
    selectedCurrencies = this.currenciesService.selectedCurrencies;
    loading = this.chargesService.loading;
    error = signal<string | null>(null);

    // Form for creating charge
    createChargeForm = this.fb.group({
        name: this.utils.requiredText(),
        amount: this.utils.requiredNumberNN(0),
        currencyCode: this.utils.makeControl(''),
        penalty: this.utils.makeControl(false),
        chargeType: this.fb.nonNullable.control<'FEE' | 'PENALTY'>('FEE')
    });

    // Controls for editing existing charges
    chargeControls: Record<number, {
        name: FormControl<string>;
        amount: FormControl<number>;
        currencyCode: FormControl<string>;
        penalty: FormControl<boolean>;
        chargeType: FormControl<'FEE' | 'PENALTY'>;
    }> = {};

    private loadCurrencies = effect(() => this.currenciesService.getCurrencies());

    // Load charges initially
    private loadCharges = effect(() => this.chargesService.getCharges());

    // Sync charge controls
    private syncControls = effect(() => {
        this.charges().forEach(charge => {
            if (!this.chargeControls[charge.id]) {
                this.chargeControls[charge.id] = {
                    name: this.utils.requiredText(charge.name),
                    amount: this.utils.requiredNumberNN(charge.amount ?? 0),
                    currencyCode: this.utils.requiredText(charge.currency?.code ?? ''),
                    penalty: this.utils.makeControl(charge.penalty ?? false),
                    chargeType: this.utils.makeEnumNN<'FEE' | 'PENALTY'>(charge.chargeType ?? 'FEE')
                };
            } else {
                const c = this.chargeControls[charge.id];
                c.name.setValue(charge.name, { emitEvent: false });
                c.amount.setValue(charge.amount ?? 0, { emitEvent: false });
                c.currencyCode.setValue(charge.currency?.code ?? '', { emitEvent: false });
                c.penalty.setValue(charge.penalty ?? false, { emitEvent: false });
                c.chargeType.setValue(charge.chargeType ?? 'FEE', { emitEvent: false });
            }
        });
    });

    // Methods
    createCharge() {
        if (this.createChargeForm.invalid) return;
        const { name, amount, currencyCode, penalty } = this.createChargeForm.value;
        this.chargesService.createCharge({
            name: name!,
            amount: amount!,
            currencyCode: currencyCode!,
            penalty: penalty!
        }).subscribe({
            next: () => this.createChargeForm.reset({
                name: '',
                amount: 0,
                currencyCode: '',
                penalty: false
            }),
            error: err => this.error.set(err.message || "Failed to create charge")
        });
    }

    updateCharge(chargeId: number) {
        const controls = this.chargeControls[chargeId];
        if (!controls) return;
        this.chargesService.updateCharge(chargeId, {
            name: controls.name.value,
            amount: controls.amount.value,
            currencyCode: controls.currencyCode.value,
            penalty: controls.penalty.value
        }).subscribe({
            error: err => this.error.set(err.message || "Failed to update charge")
        });
    }


    deleteCharge(chargeId: number) {
        this.chargesService.deleteCharge(chargeId).subscribe({
            error: err => this.error.set(err.message || "Failed to delete charge")
        });
    }
}
