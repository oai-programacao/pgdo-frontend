import { TypeOfOs, City, Period } from "./enums.model";


export interface CreateOfferRequestDto {
    typeOfOs: TypeOfOs;
    city: City;
    period: Period;
    date: string;
}

export interface ViewOfferDto {
    id: number;
    typeOfOs: TypeOfOs;
    city: string;
    period: Period;
    date: string;
    responsible: string;
    opener: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateManyAvailableOffersDto {
    typeOfOs: TypeOfOs;
    city: City;
    period: Period;
    date: string;
    quantity: number;
}

export function enumToDropdownOptions<T extends string | number>(
  enumObject: any,
  labels: Record<T, string>
): { label: string; value: T }[] {
  // Para enums string, Object.values(enumObject) funciona se os valores são as chaves.
  // Para enums numéricos ou mistos, é melhor iterar sobre as chaves de labels.
  return (Object.keys(labels) as Array<T>).map((key) => ({
    label: labels[key],
    value: enumObject[key as any] || key, // Fallback para key se enumObject não tiver a chave (caso de enum string)
  }));
}