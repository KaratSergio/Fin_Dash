import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    templateUrl: './login.html',
    styleUrls: ['./login.scss'],
})
export class LoginPage {
    username = signal('');
    password = signal('');
    error = signal<string | null>(null);

    constructor(private auth: AuthService, private router: Router) { }

    isLoggedIn = () => !!this.auth.user();
    isAdmin = () => this.auth.isAdmin;

    login() {
        this.error.set(null);

        this.auth.login(this.username(), this.password()).subscribe({
            next: () => this.router.navigate(['/admin']),
            error: (err) => this.error.set('Login failed: ' + err.message),
        });
    }
}
