export interface LoanProductCreateDto {
  name: string;
  shortName: string;
  principal: number;
  interestRatePerPeriod: number;
  numberOfRepayments: number;
  currencyCode: string;
  digitsAfterDecimal: number;
  inMultiplesOf: number;
  repaymentEvery: number;
  repaymentFrequencyType: number;
  interestRateFrequencyType: number;
  amortizationType: number;
  interestType: number;
  interestCalculationPeriodType: number;
  transactionProcessingStrategyCode: string;
  accountingRule: number;
  isInterestRecalculationEnabled: boolean;
  daysInYearType: number;
  daysInMonthType: number;
  locale: string;
  dateFormat: string;
}
