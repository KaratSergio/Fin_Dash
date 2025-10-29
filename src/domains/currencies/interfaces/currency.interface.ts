export interface CurrencyOption {
  code: string;           // Currency code, e.g., "USD"
  decimalPlaces: number;  // Number of decimal places
  displayLabel: string;   // Currency label with symbol
  displaySymbol: string;  // Symbol, e.g., "$"
  inMultiplesOf: number;  // Multiples for transactions
  name: string;           // Full name of the currency
  nameCode: string;       // Name code, e.g., "currency.USD"
}

export interface CurrencyConfigResponse {
  currencyOptions: CurrencyOption[];         // All available currencies
  selectedCurrencyOptions: CurrencyOption[]; // Permitted currencies
}