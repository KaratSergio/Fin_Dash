import { Component, signal, inject, effect } from "@angular/core";
import { RouterModule } from '@angular/router';
import { OfficesService, Office } from "../../../services/office.service";

@Component({
    selector: "app-admin-offices",
    standalone: true,
    imports: [RouterModule],
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
            fields: 'externalId,name,openingDate,parentId',
            orderBy: 'name',
            sortOrder: 'ASC'
        });
    });

    // Utils
    formatDateForApi(value: string): string {
        const d = new Date(value);
        const day = String(d.getDate()).padStart(2, '0');
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        const month = months[d.getMonth()];
        const year = d.getFullYear();
        return `${day} ${month} ${year}`; // "26 September 2025"
    }

    updateNewOfficeField(field: keyof Office, value: string | number) {
        this.newOffice.set({ ...this.newOffice(), [field]: value });
    }

    // Methods
    createOffice() {
        const payload: Partial<Office> = {
            ...this.newOffice(),
            openingDate: this.formatDateForApi(this.newOffice().openingDate!)
        };

        this.officeService.createOffice(payload).subscribe({
            next: () => {
                this.newOffice.set({
                    name: '',
                    externalId: '',
                    parentId: undefined,
                    locale: 'en',
                    dateFormat: 'dd MMMM yyyy',
                    openingDate: new Date().toISOString().split('T')[0]
                });
            },
            error: (err) => this.error.set(err.message || 'Failed to create office'),
        });
    }

    updateOffice(office: Office) {
        this.officeService.updateOffice(office.id, office).subscribe({
            error: err => this.error.set(err.message || "Failed to update office")
        });
    }

    deleteOffice(officeId: number) {
        this.officeService.deleteOffice(officeId).subscribe({
            error: err => this.error.set(err.message || "Failed to delete office")
        });
    }
}
