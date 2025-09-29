import { Component, signal, inject, effect } from "@angular/core";
import { RouterModule } from '@angular/router';
import { OfficesService, Office } from "../../../services/office.service";
import { FormatDatePipe } from "../../../pipes/format-date.pipe";
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

@Component({
    selector: "app-admin-offices",
    standalone: true,
    imports: [RouterModule, FormatDatePipe, ReactiveFormsModule],
    templateUrl: "./offices.html",
    styleUrls: ["./offices.scss"]
})
export class OfficesAdminPage {
    private fb = inject(FormBuilder);
    officeService = inject(OfficesService);

    // Signals
    offices = this.officeService.offices;
    loading = this.officeService.loading;
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

    // fetch offices list
    private loadOffices = effect(() => {
        this.officeService.getOffices({
            fields: 'id,externalId,name,openingDate,parentId',
            orderBy: 'name',
            sortOrder: 'ASC'
        });
    });

    // Methods
    createOffice() {
        if (this.createOfficeForm.invalid) return;
        this.officeService.createOffice(this.createOfficeForm.value as Partial<Office>).subscribe({
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
        this.officeService.updateOffice(officeId, office).subscribe({
            error: err => this.error.set(err.message || "Failed to update office")
        });
    }
}
