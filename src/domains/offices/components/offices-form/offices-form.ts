import { Component, Input, Output, EventEmitter } from "@angular/core";
import { ReactiveFormsModule, FormGroup } from "@angular/forms";
import { Office } from "@src/domains/offices/services/offices.service";

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
    selector: "app-offices-form",
    standalone: true,
    imports: [
        ReactiveFormsModule,
        MatFormFieldModule, MatInputModule,
        MatSelectModule, MatButtonModule,
        MatDatepickerModule, MatNativeDateModule
    ],
    templateUrl: "./offices-form.html",
    styleUrls: ["./offices-form.scss"]
})
export class OfficesForm {
    @Input() form!: FormGroup;
    @Input() offices: Office[] = [];

    @Output() submit = new EventEmitter<void>();
}
