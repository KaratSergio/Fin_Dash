import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Sidebar } from '../components/sidebar/sidebar';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Sidebar],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class App {
  showSidebar = signal(true);

  constructor(private router: Router) {
    this.router.events.subscribe((event) => {
      const url = (event as any).urlAfterRedirects ?? (event as any).url;
      this.showSidebar.set(url !== '/login');
    });
  }
}
