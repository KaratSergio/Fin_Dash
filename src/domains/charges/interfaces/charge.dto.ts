import { FormControl } from "@angular/forms";

interface ChargeBaseFields {
    name: string;
    amount: number;
    currencyCode: string;
    penalty: boolean;

    // Required fields for API with defaults
    active: boolean;
    chargeAppliesTo: number;
    chargeCalculationType: number;
    chargePaymentMode: number;
    chargeTimeType: number;
    enablePaymentType: boolean;
    locale: string;

    // additional optional
    feeFrequency?: string;
    feeInterval?: string;
    feeOnMonthDay?: string;
    maxCap?: number;
    minCap?: number;
    monthDayFormat?: string;
    paymentTypeId?: number;
    taxGroupId?: number;
}

export interface ChargeCreateDto extends ChargeBaseFields { }

export type ChargeUpdateDto = Partial<ChargeBaseFields>;

export type ChargeFormControl = {
    [K in keyof ChargeBaseFields]: FormControl<ChargeBaseFields[K]>;
};