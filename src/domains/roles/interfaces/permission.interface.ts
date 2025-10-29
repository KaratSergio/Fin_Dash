export interface Permission {
  actionName: string;    // e.g. "READ"
  code: string;          // e.g. "READ_PERMISSION"
  entityName: string;    // e.g. "PERMISSION"
  grouping: string;      // e.g. "authorisation"
  selected: boolean;     // Maker Checker enabled/disabled
}