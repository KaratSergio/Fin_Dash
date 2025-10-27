import { Component, inject, effect } from "@angular/core";
import { RouterModule } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { FormUtils } from "@core/utils/form";

import { ChargesService } from "../services/charges.service";
import { CurrenciesService } from "@domains/currencies/services/currencies.service";

import { ChargesForm } from "../components/charges-form/charges-form";
import { ChargesTable } from "../components/charges-table/charges-table";
import { Charge } from "../interfaces/charge.interface";
import { ChargeUpdateDto, ChargeCreateDto, ChargeFormControl } from "../interfaces/charge.dto";
import { handleError } from '@core/utils/error'


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
    loading = this.chargesService.loading;
    error = this.chargesService.error;
    // currencies = this.currenciesService.allCurrencies;
    selectedCurrencies = this.currenciesService.selectedCurrencies;

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

    // Load currencies & charges
    private loadData = effect(() => {
        this.currenciesService.getCurrencies();
        this.chargesService.getCharges();
    });

    // Sync charge controls
    private syncControls = effect(() => {
        const currentIds = new Set<number>();
        this.charges().forEach(charge => {
            currentIds.add(charge.id);
            if (!this.chargeControls[charge.id]) {
                this.chargeControls[charge.id] = this.createChargeControls(charge);
            } else {
                this.updateChargeControls(this.chargeControls[charge.id], charge);
            }
        });

        // Remove controls for deleted charges
        Object.keys(this.chargeControls).forEach(id => {
            if (!currentIds.has(Number(id))) {
                delete this.chargeControls[Number(id)];
            }
        });
    });

    private createChargeControls(charge: Charge): ChargeFormControl {
        return {
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
    }

    private updateChargeControls(controls: ChargeFormControl, charge: Charge) {
        controls.name.setValue(charge.name, { emitEvent: false });
        controls.amount.setValue(charge.amount ?? 0, { emitEvent: false });
        controls.currencyCode.setValue(charge.currency?.code ?? '', { emitEvent: false });
        controls.penalty.setValue(charge.penalty ?? false, { emitEvent: false });
    }

    // Methods
    async createCharge() {
        if (this.createChargeForm.invalid) return;
        const formValue = this.createChargeForm.value as ChargeCreateDto;

        try {
            await this.chargesService.createCharge(formValue);
            this.createChargeForm.reset({
                name: '',
                amount: 0,
                currencyCode: '',
                penalty: false,
                chargeType: 'FEE'
            });
        } catch (err) {
            const error = handleError(err, 'Failed to create charge');
            this.error.set(error);
        }
    }


    async updateCharge(chargeId: number) {
        const controls = this.chargeControls[chargeId];
        if (!controls) return;
        const payload: ChargeUpdateDto = {
            name: controls.name.value,
            amount: controls.amount.value,
            currencyCode: controls.currencyCode.value,
            penalty: controls.penalty.value
        };
        try {
            await this.chargesService.updateCharge(chargeId, payload)
        } catch (err) {
            const error = handleError(err, 'Failed to update charge');
            this.error.set(error);
        }
    }

    async deleteCharge(chargeId: number) {
        try {
            await this.chargesService.deleteCharge(chargeId)
        } catch (err) {
            const error = handleError(err, 'Failed to delete charge');
            this.error.set(error);
        }
    }
}
