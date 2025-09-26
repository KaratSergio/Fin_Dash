import { Component, signal, inject, effect } from "@angular/core";
import { RouterModule } from '@angular/router';
import { UsersService, AppUser } from "../../../services/user.service";
import { PasswordModal } from "../../../components/modals/password-modal";

@Component({
  selector: "app-admin-users",
  standalone: true,
  imports: [RouterModule, PasswordModal],
  templateUrl: "./users.html",
  styleUrls: ["./users.scss"]
})
export class UsersAdminPage {
  usersService = inject(UsersService);

  // Signals
  users = this.usersService.users;
  loading = this.usersService.loading;
  error = this.usersService.error;
  passwordModalVisible = signal(false);
  modalUserId?: number;

  newUser = signal<Partial<AppUser>>({
    username: '',
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    officeId: 1,   // !!! swap on select input type
    selectedRoles: []
  });

  private loadUsers = effect(() => {
    this.usersService.getUsers();
  });

  // Update fields of new user
  updateNewUserField(field: keyof AppUser, value: any) {
    this.newUser.set({ ...this.newUser(), [field]: value });
  }

  // User roles
  getRoleNames(user: AppUser): string {
    return user.selectedRoles?.map(r => r.name).join(', ') ?? '';
  }

  // Change Password Modal
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

  // Methods
  createUser() {
    this.usersService.createUser(this.newUser()).subscribe({
      next: () => {
        this.newUser.set({
          username: '',
          firstname: '',
          lastname: '',
          email: '',
          password: '',
          officeId: 1,
          selectedRoles: []
        });
      },
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
}
