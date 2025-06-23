import { ViewEmployeeDto } from "./employee.model";
import { ViewSaleDto } from "./sales.model";

export enum AfterSalesStatus {
    OPEN = 'OPEN',
    WAITING_FOR_CONTACT = 'WAITING_FOR_CONTACT',
    EXECUTED_WITH_CONTACT = 'EXECUTED_WITH_CONTACT',
    EXECUTED_WITHOUT_CONTACT = 'EXECUTED_WITHOUT_CONTACT',
    CANCELED = 'CANCELED',
}

export const AfterSalesStatusLabels: Record<AfterSalesStatus, string> = {
    [AfterSalesStatus.OPEN]: 'Aberto',
    [AfterSalesStatus.WAITING_FOR_CONTACT]: 'Aguardando Contato',
    [AfterSalesStatus.EXECUTED_WITH_CONTACT]: 'Executado com Contato',
    [AfterSalesStatus.EXECUTED_WITHOUT_CONTACT]: 'Executado sem Contato',
    [AfterSalesStatus.CANCELED]: 'Cancelado',
};

export interface ViewAfterSaleDto {
    id: string;
    attempts: number;
    lastAttemptBy: string; // ID of the employee who made the last attempt
    lastAttemptAt: string; // Date of the last attempt in pt-br format
    status: AfterSalesStatus;
    sale: ViewSaleDto; // Reference to the sale associated with this after-sale
    notes: string; // Notes or observations about the after-sale
    contactAttempts: ContactAttemptDto[]; // List of contact attempts made for this after-sale
    createdAt: string;
    updatedAt: string;
}

export interface ContactAttemptDto {
    id: string; // ID of the contact attempt
    attemptedBy: ViewEmployeeDto;
    outcome: ContactAttemptOutcome;
    attemptedAt: string; // Date of the contact attempt in pt-br format
}

export enum ContactAttemptOutcome {
    NO_AWSWER = 'NO_ANSWER', // Sem resposta
    BUSY_LINE = 'BUSY_LINE', // Linha ocupada
    SPOKE_TO_CLIENT = 'SPOKE_TO_CLIENT', // Falou com o cliente
    SPOKE_TO_RELATIVE = 'SPOKE_TO_RELATIVE', // Falou com um parente
    INVALID_NUMBER = 'INVALID_NUMBER', // Número inválido
    CLIENT_REQUESTED_CALLBACK_LATER = 'CLIENT_REQUESTED_CALLBACK_LATER', // Cliente pediu para retornar mais tarde
}

export interface CreateContactAttemptDto {
    outcome: ContactAttemptOutcome;
    notes: string;
}

export const ContactAttemptOutcomeLabels: Record<ContactAttemptOutcome, string> = {
    [ContactAttemptOutcome.NO_AWSWER]: 'Sem Resposta',
    [ContactAttemptOutcome.BUSY_LINE]: 'Linha Ocupada',
    [ContactAttemptOutcome.SPOKE_TO_CLIENT]: 'Falou com o Cliente',
    [ContactAttemptOutcome.SPOKE_TO_RELATIVE]: 'Falou com Parente',
    [ContactAttemptOutcome.INVALID_NUMBER]: 'Número Inválido',
    [ContactAttemptOutcome.CLIENT_REQUESTED_CALLBACK_LATER]: 'Cliente Pediu Retorno Mais Tarde',
};