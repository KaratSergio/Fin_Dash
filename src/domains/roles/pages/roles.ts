import { Component, inject, effect } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { FormUtils } from '@core/utils/form';

import { RolesService } from '@domains/roles/services/roles.service';
import type { Role } from '@domains/roles/interfaces/role.interface';
import type { RoleControls } from '@domains/roles/interfaces/role-controls.interface';

import { RolesForm } from '../components/roles-form/roles-form';
import { RolesTable } from '../components/roles-table/roles-table';

@Component({
  selector: 'app-admin-roles',
  standalone: true,
  imports: [RouterModule, RolesForm, RolesTable],
  templateUrl: './roles.html',
  styleUrls: ['./roles.scss'],
})
export class RolesAdminPage {
  private fb = inject(FormBuilder);
  private utils = new FormUtils(this.fb);
  roleService = inject(RolesService);

  roles = this.roleService.roles;
  loading = this.roleService.loading;

  // Form for creating role
  createRoleForm = this.fb.group({
    name: this.utils.requiredText(),
    description: this.utils.makeControl(''),
  });

  // Controls for editing existing roles
  roleControls: RoleControls = {};

  // Load roles initially
  private loadRoles = effect(() => this.roleService.refresh());

  // Sync role controls
  private syncControls = effect(() => {
    this.roles().forEach((role) => {
      if (!this.roleControls[role.id]) {
        this.roleControls[role.id] = {
          name: this.utils.requiredText(role.name),
          description: this.utils.makeControl(role.description ?? ''),
        };
      } else {
        const controls = this.roleControls[role.id];
        controls.name.setValue(role.name, { emitEvent: false });
        controls.description.setValue(role.description ?? '', { emitEvent: false });
      }
    });
  });

  // Actions
  createRole() {
    if (this.createRoleForm.invalid) return;
    this.roleService.createRole(this.createRoleForm.value)
    this.createRoleForm.reset();
  }

  updateRole(roleId: number) {
    const { name, description } = this.roleControls[roleId];
    this.roleService.updateRole(roleId, { name: name.value, description: description.value } as Role);
  }

  deleteRole(roleId: number) {
    this.roleService.deleteRole(roleId)
  }

  toggleRole(role: Role) {
    const action = role.disabled ? this.roleService.enableRole : this.roleService.disableRole;
    action.call(this.roleService, role.id)
  }
}
