import { Component, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';

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

    private auth = inject(AuthService);
    private router = inject(Router);

    isLoggedIn = () => !!this.auth.user();
    isAdmin = () => this.auth.isAdmin;

    async login() {
        this.error.set(null);

        const user = await this.auth.login(this.username(), this.password());

        if (!user) {
            this.error.set('Login failed');
            return;
        }

        const isSuperUser = user.roles.some(r => r.name === 'Super user');

        this.router.navigate([isSuperUser ? '/admin' : '/']);
    }
}
