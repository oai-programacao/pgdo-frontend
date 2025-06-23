import { ViewEmployeeDto } from "./employee.model";

export interface CreateSaleDto {
    saleDate: string; //pt-br date format
    contractNumber: number;
    contractStatus: SaleContractStatus;
    accessionStatus: SaleAccessionStatus;
}

export interface UpdateSaleDto {
    contractStatus?: SaleContractStatus;
    accessionStatus?: SaleAccessionStatus;
    observation?: string;
}

export interface TransferSaleDto {
    newEmployeeId: string; // ID of the new seller
}

export interface ViewSaleDto {
    id: string;
    clientCode: number;
    clientName: string;
    cpfOrCnpj: string;
    contractNumber: number;
    phone1: string;
    phone2: string;
    phone3: string;
    saleDate: string; //pt-br date format
    contractStatus: SaleContractStatus;
    accessionStatus: SaleAccessionStatus;
    saleStatus: SaleStatus;
    seller: ViewEmployeeDto;
    validator: ViewEmployeeDto;
    observation: string;
    planDescription: string;
    planNetValue: number;
    accessionValue: number;
    createdAt: string; //pt-br date format
    updatedAt: string; //pt-br date format
}


export enum SaleContractStatus {
    SIGNED = "SIGNED",
    WAITING_FOR_SIGNATURE = "WAITING_FOR_SIGNATURE",
    CANCELED = "CANCELED",
}

export const SaleContractStatusLabels: Record<SaleContractStatus, string> = {
    [SaleContractStatus.SIGNED]: "Assinado",
    [SaleContractStatus.WAITING_FOR_SIGNATURE]: "Aguardando Assinatura",
    [SaleContractStatus.CANCELED]: "Cancelado",
};

export enum SaleAccessionStatus {
    EXEMPTED = "EXEMPTED", //Isento
    PAID = "PAID", //Pago
    INVOICED = "INVOICED", //Faturado
    PAYING_IN_INSTALLMENTS = "PAYING_IN_INSTALLMENTS", //Pagando na instalação
    WAITING_FOR_PAYMENT = "WAITING_FOR_PAYMENT", //Aguardando pagamento
    CANCELED = "CANCELED", //Cancelado
}

export const SaleAccessionStatusLabels: Record<SaleAccessionStatus, string> = {
    [SaleAccessionStatus.EXEMPTED]: "Isento",
    [SaleAccessionStatus.PAID]: "Pago",
    [SaleAccessionStatus.INVOICED]: "Faturado",
    [SaleAccessionStatus.PAYING_IN_INSTALLMENTS]: "Pagando na instalação",
    [SaleAccessionStatus.WAITING_FOR_PAYMENT]: "Aguardando pagamento",
    [SaleAccessionStatus.CANCELED]: "Cancelado",
};

export enum SaleStatus {
    PENDING = "PENDING", //Pendente
    APPROVED = "APPROVED", //Aprovado
    CANCELED = "CANCELED", //Cancelado
    COMPLETED = "COMPLETED", //Concluído
    WAITING_APPROVAL = "WAITING_APPROVAL", //Aguardando Aprovação
}

export const SaleStatusLabels: Record<SaleStatus, string> = {
    [SaleStatus.PENDING]: "Pendente",
    [SaleStatus.APPROVED]: "Aprovado",
    [SaleStatus.CANCELED]: "Cancelado",
    [SaleStatus.COMPLETED]: "Concluído",
    [SaleStatus.WAITING_APPROVAL]: "Aguardando Aprovação",
};