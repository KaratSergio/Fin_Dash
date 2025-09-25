import { Component, signal, inject } from '@angular/core';
import { UsersService, AppUser } from '../../../services/user.service';

@Component({
  selector: 'app-users-admin',
  standalone: true,
  imports: [],
  templateUrl: './users.html',
  styleUrls: ['./users.scss'],
})
export class UsersAdminPage {
  usersService = inject(UsersService);
  loading = signal(false);
  error = signal<string | null>(null);

  users = signal<AppUser[]>([]);
  newUser = signal<Partial<AppUser>>({
    username: '',
    firstname: '',
    lastname: '',
    officeId: -1, // !!!
    roles: [''],
    email: '',
    password: ''
  });

  constructor() {
    this.getUsers();
  }

  getUsers() {
    this.loading.set(true);
    this.usersService.getUsers();
    this.users.set(this.usersService.users());
    this.loading.set(false);
  }

  // for update fields new user
  updateNewUserField(field: keyof AppUser, value: any) {
    this.newUser.update(u => ({ ...u, [field]: value }));
  }

  // for update user fields
  updateUserField(user: AppUser, field: keyof AppUser, value: any) {
    this.users.update(list => list.map(u => u.id === user.id ? { ...u, [field]: value } : u));
  }

  // Methods
  createUser() {
    this.usersService.createUser(this.newUser()).subscribe({
      next: (user) => {
        this.users.update(list => [...list, user]);
        this.newUser.set({ username: '', firstname: '', lastname: '', email: '', password: '' }); // !!! add more fields
      },
      error: (err) => this.error.set(err.message || 'Failed to create user'),
    });
  }

  deleteUser(userId: number) {
    this.usersService.deleteUser(userId).subscribe({
      next: () => this.users.update(list => list.filter(u => u.id !== userId)),
      error: (err) => this.error.set(err.message || 'Failed to delete user'),
    });
  }

  changePassword(userId: number, newPassword: string) {
    this.usersService.changePassword(userId, newPassword).subscribe({
      next: () => this.newUser.update(u => ({ ...u, password: '' })),
      error: (err) => this.error.set(err.message || 'Failed to change password'),
    });
  }

  updateUser(user: AppUser) {
    this.usersService.updateUser(user.id, user).subscribe({
      next: (updated) => {
        this.users.update(list => list.map(u => u.id === updated.id ? updated : u));
      },
      error: (err) => this.error.set(err.message || 'Failed to update user'),
    });
  }
}
