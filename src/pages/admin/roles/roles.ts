import { Component, signal, inject, effect } from "@angular/core";
import { RouterModule } from '@angular/router';
import { RolesService, Role } from "../../../services/roles.service";

@Component({
  selector: "app-admin-roles",
  standalone: true,
  imports: [RouterModule],
  templateUrl: "./roles.html",
  styleUrls: ["./roles.scss"]
})
export class RolesAdminPage {
  roleService = inject(RolesService);

  // Signals
  roles = this.roleService.roles;
  loading = this.roleService.loading;
  error = signal<string | null>(null);

  newRole = signal<Partial<Role>>({
    name: '',
    description: '',
  });

  private loadRoles = effect(() => {
    this.roleService.getRoles();
  });

  // Utils
  updateNewRoleField(field: keyof Role, value: string | boolean) {
    this.newRole.set({ ...this.newRole(), [field]: value });
  }

  // Methods
  createRole() {
    const payload: Partial<Role> = { ...this.newRole() };

    this.roleService.createRole(payload).subscribe({
      next: () => {
        this.newRole.set({
          name: '',
          description: ''
        });
      },
      error: (err) => this.error.set(err.message || 'Failed to create role'),
    });
  }

  updateRole(roleId: number, role: Partial<Role>) {
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
