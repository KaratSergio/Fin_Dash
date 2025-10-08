import { Component, inject, signal, effect } from "@angular/core";
import { RouterModule } from '@angular/router';
import { FormBuilder, FormControl } from '@angular/forms';
import { FormUtils } from "@src/core/utils/form";
import { RolesService, Role } from "@src/domains/roles/services/roles.service";

import { RolesForm } from "../components/roles-form/roles-form";
import { RolesTable } from "../components/roles-table/roles-table";

@Component({
  selector: "app-admin-roles",
  standalone: true,
  imports: [RouterModule, RolesForm, RolesTable],
  templateUrl: "./roles.html",
  styleUrls: ["./roles.scss"]
})
export class RolesAdminPage {
  private fb = inject(FormBuilder);
  private utils = new FormUtils(this.fb);
  roleService = inject(RolesService);

  roles = this.roleService.roles;
  loading = this.roleService.loading;
  error = signal<string | null>(null);

  // Form for creating role
  createRoleForm = this.fb.group({
    name: this.utils.requiredText(),
    description: this.utils.makeControl('')
  });

  // Controls for editing existing roles
  roleControls: Record<number, {
    name: FormControl<string>;
    description: FormControl<string>;
  }> = {};

  // Load roles initially
  private loadRoles = effect(() => this.roleService.getRoles());

  // Sync role controls
  private syncControls = effect(() => {
    this.roles().forEach(role => {
      if (!this.roleControls[role.id]) {
        this.roleControls[role.id] = {
          name: this.utils.requiredText(role.name),
          description: this.utils.makeControl(role.description ?? '')
        };
      } else {
        const controls = this.roleControls[role.id];
        controls.name.setValue(role.name, { emitEvent: false });
        controls.description.setValue(role.description ?? '', { emitEvent: false });
      }
    });
  });

  // Methods
  createRole() {
    if (this.createRoleForm.invalid) return;
    this.roleService.createRole(this.createRoleForm.value).subscribe({
      next: () => this.createRoleForm.reset({ name: '', description: '' }),
      error: err => this.error.set(err.message || "Failed to create role")
    });
  }

  updateRole(roleId: number) {
    const controls = this.roleControls[roleId];
    if (!controls) return;

    const payload: Partial<Role> = {
      name: controls.name.value,
      description: controls.description.value
    };

    this.roleService.updateRole(roleId, payload as Role).subscribe({
      error: err => this.error.set(err.message || "Failed to update role")
    });
  }

  deleteRole(roleId: number) {
    this.roleService.deleteRole(roleId).subscribe({
      error: err => this.error.set(err.message || "Failed to delete role")
    });
  }

  toggleRole(role: Role) {
    const action = role.disabled ? this.roleService.enableRole : this.roleService.disableRole;
    action.call(this.roleService, role.id).subscribe({
      error: err => this.error.set(err.message || "Failed to toggle role")
    });
  }
}
