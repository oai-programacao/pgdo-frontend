export enum BlockPeriodOffers {
    ALL_DAY = 'ALL_DAY',
    MORNING = 'MORNING',   
    AFTERNOON = 'AFTERNOON',
}

export const BlockPeriodOffersLabels: Record<BlockPeriodOffers, string> = {
    ALL_DAY: 'Dia Todo',
    MORNING: 'Manhã',
    AFTERNOON: 'Tarde',
};

export interface CreateBlockOffersDto {
    initialDate: string;
    periodOffer: BlockPeriodOffers;
}

export interface ViewBlockOffersDto {
    id: number;
    initialDate: string;
    periodOffer: BlockPeriodOffers;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}