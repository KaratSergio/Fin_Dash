import { Component, Input, Output, EventEmitter } from "@angular/core";
import { ReactiveFormsModule, FormControl } from "@angular/forms";
import { FormatDatePipe } from "@shared/pipes/format-date.pipe";

import { Office } from "../../services/offices.service";

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

@Component({
    selector: "app-offices-table",
    standalone: true,
    imports: [
        ReactiveFormsModule, MatFormFieldModule,
        MatSelectModule, FormatDatePipe
    ],
    templateUrl: "./offices-table.html",
    styleUrls: ["./offices-table.scss"]
})
export class OfficesTable {
    @Input() offices: Office[] = [];
    @Input() officeControls: Record<number, {
        name: FormControl<string>;
        externalId: FormControl<string>;
        parentId: FormControl<number | null>;
        openingDate: FormControl<string>;
    }> = {};

    @Output() update = new EventEmitter<Office>();
}
