import { City } from "./enums.model";

export interface ViewWiredAddressDto {
    id: string;
    clientName: string;
    city: City;
    district: string;
    street: string;
    complement: string;
}

// Interface para os filtros do formulário
export interface WiredAddressFilters {
  clientName?: string | null;
  address?: string | null;
  cities?: City[] | null;
}