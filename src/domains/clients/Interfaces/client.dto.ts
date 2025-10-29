import { Client } from './client.interface';

interface LocaleFields {
  dateFormat: string;
  locale: string;
}

interface ClientBaseFields {
  firstname: string;
  lastname: string;
  emailAddress: string;
  mobileNo: string;
  externalId: string;
}

export interface CreateClientDto extends ClientBaseFields, LocaleFields {
  officeId: number;
  legalFormId: number;
  active: boolean;
  activationDate: string;
}

export interface UpdateClientDto extends ClientBaseFields {}

export interface TransferClientDto extends LocaleFields {
  destinationOfficeId: number;
  transferDate: string;
}

export interface ClientsResponse {
  pageItems: Client[];
  totalFilteredRecords: number;
}

export interface ClientQueryParams {
  offset: number; // Offset (for pagination)
  limit: number; // Number of records per page
  orderBy: string; // Sorting field
  sortOrder: 'ASC' | 'DESC'; // Sorting direction
}
