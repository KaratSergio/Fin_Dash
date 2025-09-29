import { Component, signal, inject, effect } from "@angular/core";
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { RolesService, Role } from "../../../services/roles.service";

@Component({
  selector: "app-admin-roles",
  standalone: true,
  imports: [RouterModule, ReactiveFormsModule, MatInputModule],
  templateUrl: "./roles.html",
  styleUrls: ["./roles.scss"]
})
export class RolesAdminPage {
  private fb = inject(FormBuilder);
  roleService = inject(RolesService);

  // Signals
  roles = this.roleService.roles;
  loading = this.roleService.loading;
  error = signal<string | null>(null);

  // Reactive form
  createRoleForm = this.fb.group({
    name: ['', Validators.required],
    description: ['']
  });

  // fetch roles list
  private loadRoles = effect(() => {
    this.roleService.getRoles();
  });

  // Methods
  createRole() {
    if (this.createRoleForm.invalid) return;

    this.roleService.createRole(this.createRoleForm.value as Partial<Role>).subscribe({
      next: () => this.createRoleForm.reset({ name: '', description: '' }),
      error: err => this.error.set(err.message || 'Failed to create role')
    });
  }

  updateRole(roleId: number, role: Role) {
    this.roleService.updateRole(roleId, role).subscribe({
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
