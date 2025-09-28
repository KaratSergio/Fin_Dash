import { Component, signal, inject, effect } from "@angular/core";
import { RouterModule } from '@angular/router';
import { OfficesService, Office } from "../../../services/office.service";
import { FormatDatePipe } from "../../../pipes/format-date.pipe";

@Component({
    selector: "app-admin-offices",
    standalone: true,
    imports: [RouterModule, FormatDatePipe],
    templateUrl: "./offices.html",
    styleUrls: ["./offices.scss"]
})
export class OfficesAdminPage {
    officeService = inject(OfficesService);

    // Signals
    offices = this.officeService.offices;
    loading = this.officeService.loading;
    error = signal<string | null>(null);

    newOffice = signal<Partial<Office>>({
        name: '',
        externalId: '',
        parentId: undefined,
        dateFormat: 'dd MMMM yyyy',
        locale: 'en',
        openingDate: new Date().toISOString().split('T')[0]
    });

    private loadOffices = effect(() => {
        this.officeService.getOffices({
            fields: 'id,externalId,name,openingDate,parentId',
            orderBy: 'name',
            sortOrder: 'ASC'
        });
    });

    private resetNewOffice() {
        this.newOffice.set({
            name: '',
            externalId: '',
            parentId: undefined,
            locale: 'en',
            dateFormat: 'dd MMMM yyyy',
            openingDate: new Date().toISOString().split('T')[0]
        });
    }

    updateNewOfficeField(field: keyof Office, value: string | number) {
        this.newOffice.set({ ...this.newOffice(), [field]: value });
    }

    // Methods
    createOffice() {
        this.officeService.createOffice(this.newOffice()).subscribe({
            next: () => this.resetNewOffice(),
            error: err => this.error.set(err.message || 'Failed to create office')
        });
    }

    updateOffice(officeId: number, office: Office) {
        this.officeService.updateOffice(officeId, office).subscribe({
            error: err => this.error.set(err.message || "Failed to update office")
        });
    }
}
