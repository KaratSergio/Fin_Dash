import { Component, inject, signal, effect } from "@angular/core";
import { RouterModule } from '@angular/router';
import { FormBuilder, FormControl } from '@angular/forms';
import { FormUtils } from "@core/utils/form";

import { ChargesService } from "../services/charges.service";
import { CurrenciesService } from "@domains/currencies/services/currencies.service";

import { ChargesForm } from "../components/charges-form/charges-form";
import { ChargesTable } from "../components/charges-table/charges-table";
import { ChargeUpdateDto, ChargeCreateDto, ChargeFormControl } from "../interfaces/charge.dto";


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
        name: this.utils.requiredText<ChargeCreateDto['name']>(),
        amount: this.utils.requiredNumberNN<ChargeCreateDto['amount']>(0),
        currencyCode: this.utils.makeControl<ChargeCreateDto['currencyCode']>(''),
        penalty: this.utils.makeControl<ChargeCreateDto['penalty']>(false),
        chargeType: this.fb.nonNullable.control<'FEE' | 'PENALTY'>('FEE')
    });

    // Controls for editing existing charges
    chargeControls: Record<number, ChargeFormControl> = {};

    private loadCurrencies = effect(() => this.currenciesService.getCurrencies());

    // Load charges initially
    private loadCharges = effect(() => this.chargesService.getCharges());

    // Sync charge controls
    private syncControls = effect(() => {
        this.charges().forEach(charge => {
            if (!this.chargeControls[charge.id]) {
                this.chargeControls[charge.id] = {
                    name: this.utils.requiredText<string>(charge.name ?? ''),
                    amount: this.utils.requiredNumberNN<number>(charge.amount ?? 0),
                    currencyCode: this.utils.requiredText<string>(charge.currency?.code ?? ''),
                    penalty: this.utils.makeBooleanNN<boolean>(charge.penalty ?? false),
                    active: this.utils.makeBooleanNN<boolean>(true),
                    chargeAppliesTo: this.utils.makeControl<number>(1),
                    chargeCalculationType: this.utils.makeControl<number>(1),
                    chargePaymentMode: this.utils.makeControl<number>(1),
                    chargeTimeType: this.utils.makeControl<number>(1),
                    enablePaymentType: this.utils.makeBooleanNN<boolean>(true),
                    locale: this.utils.makeControl<string>('en'),
                };
            } else {
                const c = this.chargeControls[charge.id];
                c.name.setValue(charge.name, { emitEvent: false });
                c.amount.setValue(charge.amount ?? 0, { emitEvent: false });
                c.currencyCode.setValue(charge.currency?.code ?? '', { emitEvent: false });
                c.penalty.setValue(charge.penalty ?? false, { emitEvent: false });
            }
        });
    });

    // Methods
    createCharge() {
        if (this.createChargeForm.invalid) return;

        const formValue = this.createChargeForm.value as ChargeCreateDto;
        this.chargesService.createCharge(formValue).subscribe({
            next: () => this.createChargeForm.reset({
                name: '',
                amount: 0,
                currencyCode: '',
                penalty: false,
                chargeType: 'FEE'
            }),
            error: err => this.error.set(err.message || "Failed to create charge")
        });
    }

    updateCharge(chargeId: number) {
        const controls = this.chargeControls[chargeId];
        if (!controls) return;

        const payload: ChargeUpdateDto = {
            name: controls.name.value,
            amount: controls.amount.value,
            currencyCode: controls.currencyCode.value,
            penalty: controls.penalty.value
        };

        this.chargesService.updateCharge(chargeId, payload).subscribe({
            error: err => this.error.set(err.message || "Failed to update charge")
        });
    }

    deleteCharge(chargeId: number) {
        this.chargesService.deleteCharge(chargeId).subscribe({
            error: err => this.error.set(err.message || "Failed to delete charge")
        });
    }
}
