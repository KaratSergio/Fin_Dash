import { Component, inject } from '@angular/core';
import { CurrenciesService } from '@domains/currencies/services/currencies.service';

@Component({
  selector: 'app-overview',
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
})
export class Dashboard {
  currenciesService = inject(CurrenciesService);

  allCurrencies = this.currenciesService.allCurrencies;
  selectedCurrencies = this.currenciesService.selectedCurrencies;
  loading = this.currenciesService.loading;
  error = this.currenciesService.error;

  init = (() => {
    queueMicrotask(() => this.currenciesService.getCurrencies());
  })();
}
