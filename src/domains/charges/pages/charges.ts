import { Component, inject, signal, effect } from "@angular/core";
import { RouterModule } from '@angular/router';
import { FormBuilder, FormControl } from '@angular/forms';
import { FormUtils } from "@core/utils/form";

import { ChargesService, Charge } from "../services/charges.service";

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

    charges = this.chargesService.charges;
    loading = this.chargesService.loading;
    error = signal<string | null>(null);

    // Form for creating charge
    createChargeForm = this.fb.group({
        name: this.utils.requiredText(),
        description: this.utils.makeControl(''),
        amount: this.utils.requiredNumberNN(0),
        currencyCode: this.utils.requiredText(),
        penalty: this.utils.makeControl(false),
        chargeType: this.fb.nonNullable.control<'FEE' | 'PENALTY'>('FEE')
    });

    // Controls for editing existing charges
    chargeControls: Record<number, {
        name: FormControl<string>;
        description: FormControl<string>;
        amount: FormControl<number>;
        currencyCode: FormControl<string>;
        penalty: FormControl<boolean>;
        chargeType: FormControl<'FEE' | 'PENALTY'>;
    }> = {};

    // Load charges initially
    private loadCharges = effect(() => this.chargesService.getCharges());

    // Sync charge controls
    private syncControls = effect(() => {
        this.charges().forEach(charge => {
            if (!this.chargeControls[charge.id]) {
                this.chargeControls[charge.id] = {
                    name: this.utils.requiredText(charge.name),
                    description: this.utils.makeControl(charge.description ?? ''),
                    amount: this.utils.requiredNumberNN(charge.amount ?? 0),
                    currencyCode: this.utils.requiredText(charge.currencyCode ?? ''),
                    penalty: this.utils.makeControl(charge.penalty ?? false),
                    chargeType: this.utils.makeEnumNN<'FEE' | 'PENALTY'>(charge.chargeType ?? 'FEE')
                };
            } else {
                const c = this.chargeControls[charge.id];
                c.name.setValue(charge.name, { emitEvent: false });
                c.description.setValue(charge.description ?? '', { emitEvent: false });
                c.amount.setValue(charge.amount ?? 0, { emitEvent: false });
                c.currencyCode.setValue(charge.currencyCode ?? '', { emitEvent: false });
                c.penalty.setValue(charge.penalty ?? false, { emitEvent: false });
                c.chargeType.setValue(charge.chargeType ?? 'FEE', { emitEvent: false });
            }
        });
    });

    // Methods
    createCharge() {
        if (this.createChargeForm.invalid) return;
        this.chargesService.createCharge(this.createChargeForm.value).subscribe({
            next: () => this.createChargeForm.reset({
                name: '',
                description: '',
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
            description: controls.description.value,
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
