import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import type { Role } from '@domains/roles/interfaces/role.interface';
import type { RoleControls } from '@domains/roles/interfaces/role-controls.interface';

@Component({
  selector: 'app-roles-table',
  standalone: true,
  imports: [ReactiveFormsModule, MatInputModule, MatButtonModule],
  templateUrl: './roles-table.html',
  styleUrls: ['./roles-table.scss'],
})
export class RolesTable {
  @Input() roles: Role[] = [];
  @Input() roleControls: RoleControls = {};

  @Output() update = new EventEmitter<number>();
  @Output() delete = new EventEmitter<number>();
  @Output() toggle = new EventEmitter<Role>();
}
