import { Component, inject } from '@angular/core';
import { CurrenciesService } from '@src/services/currencies.service';

@Component({
  selector: 'app-overview',
  standalone: true,
  templateUrl: './overview.html',
  styleUrls: ['./overview.scss'],
})
export class Overview {
  currenciesService = inject(CurrenciesService);

  allCurrencies = this.currenciesService.allCurrencies;
  selectedCurrencies = this.currenciesService.selectedCurrencies;
  loading = this.currenciesService.loading;
  error = this.currenciesService.error;

  init = (() => {
    queueMicrotask(() => this.currenciesService.getCurrencies());
  })();
}
