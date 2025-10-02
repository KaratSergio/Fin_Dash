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
        externalId: this.makeControl('')
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

        const formValue = {
            ...this.createClientForm.value,
            officeId: Number(this.createClientForm.value.officeId), // convert to number
            externalId: this.createClientForm.value.externalId || undefined
        } as Partial<Client>;

        this.clientsService.createClient(formValue).subscribe({
            next: () => this.createClientForm.reset(),
            error: err => this.error.set(err.message || "Failed to create client")
        });
    }

    updateClient(client: Client) {
        this.clientsService.updateClient(client.id, client).subscribe({
            error: err => this.error.set(err.message || "Failed to update client")
        });
    }

    deleteClient(id: number) {
        this.clientsService.deleteClient(id).subscribe({
            error: err => this.error.set(err.message || "Failed to delete client")
        });
    }
}
