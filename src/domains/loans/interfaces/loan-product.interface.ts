export interface Currency {
    code: string;
    name: string;
    decimalPlaces: number;
}

export interface AccountingRule {
    id: number;
    code: string;
    value: string;
}

export interface Status {
    id: number;
    code: string;
    value: string;
}

export interface LoanProduct {
    id: number;
    name: string;
    shortName: string;
    description?: string;
    principal?: number;
    interestRatePerPeriod?: number;
    numberOfRepayments?: number;
    repaymentEvery?: number;
    interestRateFrequencyType?: number;
    interestType?: number;
    amortizationType?: number;
    repaymentFrequencyType: number;
    loanType?: string;
    loanTermFrequencyType?: number;
    interestCalculationPeriodType?: number;
    transactionProcessingStrategyCode?: string;
    currency?: Currency;
    accountingRule?: AccountingRule;
    status?: Status;
}
