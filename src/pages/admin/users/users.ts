import { Component, signal, inject, effect } from "@angular/core";
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, FormControl } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { UsersService, AppUser } from "../../../services/user.service";
import { RolesService } from "../../../services/roles.service";
import { OfficesService } from "../../../services/office.service";

import { PasswordModal } from "../../../components/modals/password-modal";

@Component({
  selector: "app-admin-users",
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterModule, PasswordModal,
    MatFormFieldModule, MatSelectModule,
    MatInputModule, MatButtonModule
  ],
  templateUrl: "./users.html",
  styleUrls: ["./users.scss"]
})
export class UsersAdminPage {
  private fb = inject(FormBuilder);
  usersService = inject(UsersService);
  rolesService = inject(RolesService);
  officesService = inject(OfficesService);

  // Signals
  users = this.usersService.users;
  roles = this.rolesService.roles;
  loading = this.usersService.loading;
  error = signal<string | null>(null);
  passwordModalVisible = signal(false);
  modalUserId?: number;

  // Reactive form
  createUserForm = this.fb.group({
    username: ['', Validators.required],
    firstname: ['', Validators.required],
    lastname: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    officeId: ['', Validators.required],
    roles: [[] as number[], Validators.required]
  });

  userControls: { [id: number]: { office: FormControl; roles: FormControl } } = {};

  private loadUsers = effect(() => {
    this.usersService.getUsers();
    this.rolesService.getRoles();
    this.officesService.getOffices();
  });

  private syncUserControls = effect(() => {
    const list: AppUser[] = this.users();
    list.forEach(user => {
      if (!this.userControls[user.id]) {
        this.userControls[user.id] = {
          office: new FormControl(user.officeId ?? null),
          roles: new FormControl(user.roles ?? [])
        };
      } else {
        this.userControls[user.id].office.setValue(user.officeId ?? null, { emitEvent: false });
        this.userControls[user.id].roles.setValue(user.roles ?? [], { emitEvent: false });
      }
    });
  });

  createUser() {
    if (this.createUserForm.invalid) return;

    const payload: Partial<AppUser> = {
      ...this.createUserForm.value,
      sendPasswordToEmail: false, // !! temporarily disabled, dev mode (hardcode)
      repeatPassword: this.createUserForm.value.password // !! temporarily unavailable, dev mode (hardcode)
    } as Partial<AppUser>;

    this.usersService.createUser(payload).subscribe({
      next: () => this.createUserForm.reset({
        username: '',
        firstname: '',
        lastname: '',
        email: '',
        password: '',
        officeId: '',
        roles: []
      }),
      error: (err) => this.error.set(err.message || 'Failed to create user'),
    });
  }

  updateUser(user: AppUser) {
    this.usersService.updateUser(user.id, user).subscribe({
      error: err => this.error.set(err.message || "Failed to update user")
    });
  }

  deleteUser(userId: number) {
    this.usersService.deleteUser(userId).subscribe({
      error: err => this.error.set(err.message || "Failed to delete user")
    });
  }

  changePassword(userId: number, newPassword: string) {
    this.usersService.changePassword(userId, newPassword).subscribe({
      error: err => this.error.set(err.message || "Failed to change password")
    });
  }

  openPasswordModal(userId: number) {
    this.modalUserId = userId;
    this.passwordModalVisible.set(true);
  }

  handleSavePassword(event: { userId: number; password: string }) {
    this.changePassword(event.userId, event.password);
    this.passwordModalVisible.set(false);
    this.modalUserId = undefined;
  }

  handleCloseModal() {
    this.passwordModalVisible.set(false);
    this.modalUserId = undefined;
  }

  getRoleNames(user: AppUser): string {
    return user.selectedRoles?.map(r => r.name).join(', ') ?? '';
  }
}
