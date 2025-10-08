import { Component, Input, Output, EventEmitter } from "@angular/core";
import { ReactiveFormsModule, FormControl } from "@angular/forms";

import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { NgxMaskDirective } from "ngx-mask";

import { Client } from "@src/domains/clients/services/clients.service";
import { OfficesService } from "@src/domains/offices/services/offices.service";

@Component({
    selector: "app-client-table",
    standalone: true,
    imports: [
        ReactiveFormsModule, NgxMaskDirective,
        MatFormFieldModule, MatSelectModule,
        MatInputModule, MatButtonModule
    ],
    templateUrl: "./clients-table.html",
    styleUrls: ["./clients-table.scss"],
})
export class ClientTable {
    @Input() clients: Client[] = [];
    @Input() clientControls: Record<number, {
        firstname: FormControl<string | null>,
        lastname: FormControl<string | null>,
        emailAddress: FormControl<string | null>,
        mobileNo: FormControl<string | null>,
        office: FormControl<number | null>
    }> = {};
    @Input() officesService!: OfficesService;

    @Output() update = new EventEmitter<Client>();
    @Output() transfer = new EventEmitter<Client>();
    @Output() delete = new EventEmitter<number>();
}
