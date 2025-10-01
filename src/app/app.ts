import { Component, computed, inject } from '@angular/core';
import { Router, NavigationEnd, Event as RouterEvent, RouterOutlet } from '@angular/router';
import { Sidebar } from '@src/components/sidebar/sidebar';
import { filter } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Sidebar],
  template: `
    <div class="app-container">
      @if (showSidebar()) {<app-sidebar></app-sidebar>}

      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      height: 100vh;
    }

    .main-content {
      flex: 1;
      overflow-y: auto;
    }
  `],
})
export class App {
  private router = inject(Router);

  private navigationEnd = toSignal(
    this.router.events.pipe(
      filter((event: RouterEvent): event is NavigationEnd => event instanceof NavigationEnd)
    ),
    { initialValue: null }
  );

  showSidebar = computed(() => {
    const event = this.navigationEnd();
    return !event || event.urlAfterRedirects !== '/login';
  });
}
