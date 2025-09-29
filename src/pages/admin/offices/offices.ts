import { Component, signal, inject, effect } from "@angular/core";
import { RouterModule } from '@angular/router';
import { OfficesService, Office } from "../../../services/office.service";
import { FormatDatePipe } from "../../../pipes/format-date.pipe";
import { ReactiveFormsModule, FormBuilder, Validators, FormControl } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';

@Component({
    selector: "app-admin-offices",
    standalone: true,
    imports: [
        RouterModule, FormatDatePipe, ReactiveFormsModule,
        MatFormFieldModule, MatInputModule, MatDatepickerModule,
        MatNativeDateModule, MatButtonModule, MatSelectModule
    ],
    templateUrl: "./offices.html",
    styleUrls: ["./offices.scss"]
})
export class OfficesAdminPage {
    private fb = inject(FormBuilder);
    officesService = inject(OfficesService);

    // Signals
    offices = this.officesService.offices;
    loading = this.officesService.loading;
    error = signal<string | null>(null);

    // Reactive form
    createOfficeForm = this.fb.group({
        name: ['', Validators.required],
        externalId: [''],
        parentId: [null],
        dateFormat: ['dd MMMM yyyy'],
        locale: ['en'],
        openingDate: [new Date().toISOString().split('T')[0], Validators.required]
    });

    officeControls: { [key: number]: FormControl } = {};

    // fetch offices list
    private loadOffices = effect(() => {
        this.officesService.getOffices({
            fields: 'id,externalId,name,openingDate,parentId',
            orderBy: 'name',
            sortOrder: 'ASC'
        });
    });

    private syncControls = effect(() => {
        const list = this.offices();
        list.forEach(office => {
            if (!this.officeControls[office.id]) {
                this.officeControls[office.id] = new FormControl(office.parentId ?? null);
            } else {
                this.officeControls[office.id].setValue(office.parentId ?? null, { emitEvent: false });
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
                locale: 'en',
                dateFormat: 'dd MMMM yyyy',
                openingDate: new Date().toISOString().split('T')[0]
            }),
            error: err => this.error.set(err.message || 'Failed to create office')
        });
    }

    updateOffice(officeId: number, office: Office) {
        this.officesService.updateOffice(officeId, office).subscribe({
            error: err => this.error.set(err.message || "Failed to update office")
        });
    }
}
