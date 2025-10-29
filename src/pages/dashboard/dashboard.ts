import { Component, inject } from '@angular/core';
// import { CurrenciesService } from '@domains/currencies/services/currencies.service';
import { PermissionsService } from '@src/domains/roles/services/permission.service';

@Component({
  selector: 'app-overview',
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
})
export class Dashboard {
  // currenciesService = inject(CurrenciesService);
  permissionsService = inject(PermissionsService);

  // allCurrencies = this.currenciesService.allCurrencies;
  // selectedCurrencies = this.currenciesService.selectedCurrencies;
  // loading = this.currenciesService.loading;
  // error = this.currenciesService.error;
  permissions = this.permissionsService.permissions;
  loading = this.permissionsService.loading;
  error = this.permissionsService.error;

  init = (() => {
    // queueMicrotask(() => this.currenciesService.getCurrencies());
    queueMicrotask(() => this.permissionsService.refresh());
  })();
}
