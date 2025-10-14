export interface LoanTimeline {
    submittedOnDate: [number, number, number];
    actualMaturityDate: [number, number, number];
    expectedDisbursementDate: [number, number, number];
    expectedMaturityDate: [number, number, number];
    submittedByFirstname: string;
    submittedByLastname: string;
    submittedByUsername: string;
}
