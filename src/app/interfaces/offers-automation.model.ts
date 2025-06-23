import { City, Period, TypeOfOs } from "./enums.model";

export enum OfferAutomationType {
    WORKING_DAY = 'WORKING_DAY',
    WEEKEND = 'WEEKEND'
}

export const OfferAutomationTypeLabels: Record<OfferAutomationType, string> = {
    [OfferAutomationType.WORKING_DAY]: 'Dias Úteis',
    [OfferAutomationType.WEEKEND]: 'Fim de Semana'
};

export interface CreateOffersAutomationDto {
    description: string;
    serviceOrderTypes: TypeOfOs[];
    periods: Period[];
    cities: City[];
    offerAutomationType: OfferAutomationType;
    quantity: number;
}

export interface UpdateOffersAutomationDto {
    isActive?: boolean;
}

export interface ViewOffersAutomationDto {
    id: string;
    description: string;
    isActive: boolean;
    creator: string;
    serviceOrderTypes: TypeOfOs[];
    periods: Period[];
    cities: City[];
    offerAutomationType: 'WORKING_DAY' | 'WEEKEND';
    quantity: number;
    createdAt: Date;
    updatedAt: Date;
}