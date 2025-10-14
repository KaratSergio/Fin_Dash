export interface LoanProductUpdateDto {
    name?: string;
    shortName?: string;
    principal?: number;
    interestRatePerPeriod?: number;
    numberOfRepayments?: number;
    interestType?: number;
    amortizationType?: number;
    repaymentFrequencyType?: number;
}
