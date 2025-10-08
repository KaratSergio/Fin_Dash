import { Component, inject, signal, effect } from "@angular/core";
import { RouterModule } from '@angular/router';
import { FormBuilder, FormControl } from '@angular/forms';
import { OfficesService, Office } from "@src/domains/offices/services/offices.service";
import { FormUtils } from "@src/core/utils/form";

import { OfficesForm } from "../components/offices-form/offices-form";
import { OfficesTable } from "../components/offices-table/offices-table";

@Component({
    selector: "app-admin-offices",
    standalone: true,
    imports: [RouterModule, OfficesForm, OfficesTable],
    templateUrl: "./offices.html",
    styleUrls: ["./offices.scss"]
})
export class OfficesAdminPage {
    private fb = inject(FormBuilder);
    private utils = new FormUtils(this.fb);
    officesService = inject(OfficesService);

    offices = this.officesService.offices;
    loading = this.officesService.loading;
    error = signal<string | null>(null);

    // Form for creating office
    createOfficeForm = this.fb.group({
        name: this.utils.requiredText(),
        externalId: this.utils.makeControl(''),
        parentId: this.utils.makeControl<number | null>(null),
        openingDate: this.utils.requiredText(new Date().toISOString().split('T')[0]),
        locale: this.utils.makeControl('en'),
        dateFormat: this.utils.makeControl('dd MMMM yyyy')
    });

    // Controls for editing existing offices
    officeControls: Record<number, {
        name: FormControl<string>;
        externalId: FormControl<string>;
        parentId: FormControl<number | null>;
        openingDate: FormControl<string>;
    }> = {};

    // Load offices initially
    private loadOffices = effect(() => {
        this.officesService.getOffices({
            fields: 'id,externalId,name,openingDate,parentId',
            orderBy: 'name',
            sortOrder: 'ASC'
        });
    });

    // Sync office controls
    private syncControls = effect(() => {
        this.offices().forEach(office => {
            if (!this.officeControls[office.id]) {
                this.officeControls[office.id] = {
                    name: this.utils.requiredText(office.name),
                    externalId: this.utils.makeControl(office.externalId ?? ''),
                    parentId: this.utils.makeControl(office.parentId ?? null),
                    openingDate: this.utils.requiredText(office.openingDate ?? '')
                };
            } else {
                const controls = this.officeControls[office.id];
                controls.name.setValue(office.name, { emitEvent: false });
                controls.externalId.setValue(office.externalId ?? '', { emitEvent: false });
                controls.parentId.setValue(office.parentId ?? null, { emitEvent: false });
                controls.openingDate.setValue(office.openingDate ?? '', { emitEvent: false });
            }
        });
    });

    // Methods
    createOffice() {
        if (this.createOfficeForm.invalid) return;
        this.officesService.createOffice(this.createOfficeForm.value as Partial<Office>).subscribe({
            next: () => this.createOfficeForm.reset({
                name: '',
                externalId: '',
                parentId: null,
                openingDate: new Date().toISOString().split('T')[0],
                locale: 'en',
                dateFormat: 'dd MMMM yyyy'
            }),
            error: err => this.error.set(err.message || 'Failed to create office')
        });
    }

    updateOffice(office: Office) {
        const controls = this.officeControls[office.id];
        if (!controls) return;

        const payload: Partial<Office> = {
            name: controls.name.value,
            externalId: controls.externalId.value,
            parentId: controls.parentId.value ?? undefined,
            openingDate: controls.openingDate.value
        };

        this.officesService.updateOffice(office.id, payload).subscribe({
            error: err => this.error.set(err.message || "Failed to update office")
        });
    }

}
