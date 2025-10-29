type ChargeType = 'FEE' | 'PENALTY';

interface IdValuePair {
  id: number;
  value: string;
}

interface ChargeCurrency {
  code: string;
  name: string;
  displaySymbol?: string;
}

interface ChargeBaseFields {
  name: string;
  amount: number;
  penalty: boolean;
}

export interface Charge extends ChargeBaseFields {
  id: number;
  chargeTimeType: IdValuePair;
  chargeCalculationType: IdValuePair;
  currency: ChargeCurrency;
  status: string;
  chargeType: ChargeType;
}

export interface ChargeTemplate {
  chargeTimeTypeOptions: IdValuePair[];
  chargeCalculationTypeOptions: IdValuePair[];
  currencyOptions: ChargeCurrency[];
}
