import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { Role } from '@domains/roles/services/roles.service';

@Component({
  selector: 'app-roles-table',
  standalone: true,
  imports: [ReactiveFormsModule, MatInputModule, MatButtonModule],
  templateUrl: './roles-table.html',
  styleUrls: ['./roles-table.scss'],
})
export class RolesTable {
  @Input() roles: Role[] = [];
  @Input() roleControls: Record<
    number,
    { name: FormControl<string>; description: FormControl<string> }
  > = {};

  @Output() update = new EventEmitter<number>();
  @Output() delete = new EventEmitter<number>();
  @Output() toggle = new EventEmitter<Role>();
}
