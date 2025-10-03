import { Component, inject, signal, effect } from "@angular/core";
import { ReactiveFormsModule, FormBuilder, Validators, FormControl } from "@angular/forms";
import { RouterModule } from "@angular/router";

import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";

import { ClientsService, Client } from "@src/services/clients.service";
import { OfficesService } from "@src/services/office.service";

@Component({
    selector: "app-admin-clients",
    standalone: true,
    imports: [
        ReactiveFormsModule,
        RouterModule,
        MatFormFieldModule, MatSelectModule,
        MatInputModule, MatButtonModule
    ],
    templateUrl: "./clients.html",
    styleUrls: ["./clients.scss"]
})
export class ClientsPage {
    private fb = inject(FormBuilder);
    clientsService = inject(ClientsService);
    officesService = inject(OfficesService);

    clients = this.clientsService.clients;
    loading = this.clientsService.loading;
    error = signal<string | null>(null);

    private makeControl<T>(value: T, validators: any[] = []) {
        return this.fb.nonNullable.control(value, { validators });
    }

    createClientForm = this.fb.group({
        firstname: this.makeControl('', [Validators.required]),
        lastname: this.makeControl('', [Validators.required]),
        mobileNo: this.makeControl(''),
        emailAddress: this.makeControl('', [Validators.required, Validators.email]),
        officeId: this.makeControl('', [Validators.required]),
        externalId: this.makeControl(''),
        legalFormId: this.makeControl(1, [Validators.required]) // default PERSON (1)
    });

    clientControls: { [id: number]: { office: FormControl } } = {};

    private loadData = effect(() => {
        this.clientsService.getClients();
        this.officesService.getOffices();
    });

    private syncControls = effect(() => {
        const list: Client[] = this.clients();
        list.forEach(c => {
            if (!this.clientControls[c.id]) {
                this.clientControls[c.id] = {
                    office: new FormControl(c.officeId ?? null)
                };
            } else {
                this.clientControls[c.id].office.setValue(c.officeId ?? null, { emitEvent: false });
            }
        });
    });

    createClient() {
        if (this.createClientForm.invalid) return;

        const formValue = this.createClientForm.value;

        const payload = {
            firstname: formValue.firstname,
            lastname: formValue.lastname,
            emailAddress: formValue.emailAddress,
            mobileNo: formValue.mobileNo || undefined,
            officeId: Number(formValue.officeId),
            externalId: formValue.externalId || undefined,
            legalFormId: Number(formValue.legalFormId),
            active: true,
            activationDate: new Date().toISOString().split("T")[0], // yyyy-MM-dd
            dateFormat: "yyyy-MM-dd",
            locale: "en"
        };

        this.clientsService.createClient(payload).subscribe({
            next: () => this.createClientForm.reset(),
            error: err => this.error.set(err.message || "Failed to create client")
        });
    }

    updateClient(client: Client) {
        this.clientsService.updateClient(client.id, {
            firstname: client.firstname,
            lastname: client.lastname,
            emailAddress: client.emailAddress,
            mobileNo: client.mobileNo,
            externalId: client.externalId,
        }).subscribe({
            error: err => this.error.set(err.message || "Failed to update client")
        });
    }

    transferClient(client: Client) {
        const officeId = this.clientControls[client.id]?.office.value;

        if (!officeId) {
            this.error.set("Please select an office before transfer");
            return;
        }

        this.clientsService.transferClientPropose(client.id, officeId).subscribe({
            error: err => this.error.set(err.message || "Failed to transfer client")
        });
    }

    deleteClient(id: number) {
        this.clientsService.deleteClient(id).subscribe({
            error: err => this.error.set(err.message || "Failed to delete client")
        });
    }
}
