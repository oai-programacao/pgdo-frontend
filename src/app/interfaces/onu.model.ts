import { ViewEmployeeDto } from "./employee.model";

export enum OnuSignal {
    LOS = 'LOS',
    WITH_PROBLEM = 'WITH_PROBLEM',
    NORMAL = 'NORMAL',
}

export const OnuSignalLabels: Record<OnuSignal, string> = {
    [OnuSignal.LOS]: 'LOS - Perda de Sinal',
    [OnuSignal.WITH_PROBLEM]: 'Com Problema',
    [OnuSignal.NORMAL]: 'Sinal Normal',
};

export enum OnuColor {
    WHITE = 'WHITE',
    BLACK = 'BLACK',
}

export const OnuColorLabels: Record<OnuColor, string> = {
    [OnuColor.WHITE]: 'Branca',
    [OnuColor.BLACK]: 'Preta',
};

export enum OnuCertificate {
    CHINESE = 'CHINESE',
    BRAZILIAN = 'BRAZILIAN',
}

export const OnuCertificateLabels: Record<OnuCertificate, string> = {
    [OnuCertificate.CHINESE]: 'Chinesa',
    [OnuCertificate.BRAZILIAN]: 'Brasileira',
};

export enum OnuMaintenanceStatus {
    FIXED = 'FIXED',
    NOT_FIXED = 'NOT_FIXED',
}

export const OnuMaintenanceStatusLabels: Record<OnuMaintenanceStatus, string> = {
    [OnuMaintenanceStatus.FIXED]: 'Arrumada',
    [OnuMaintenanceStatus.NOT_FIXED]: 'Não Arrumada',
};


export interface CreateOnuDto {
    onuCertificate: OnuCertificate;
    serialNumber: string;
    model: string;
    onuColor: OnuColor;
    onuSignal: OnuSignal;
    observation?: string;
}

export interface CreateOnuMaintenanceDto {
    observation?: string;
    detectedProblem: string;
    status: OnuMaintenanceStatus;
    signal: OnuSignal;
}

export interface UpdateOnuDto {
    serialNumber: string;
    model: string;
    onuCertificate: OnuCertificate;
    onuColor: OnuColor;
    onuSignal: OnuSignal;
}

export interface ViewOnuDto {
    id: string;
    serialNumber: string;
    model: string;
    onuCertificate: OnuCertificate;
    onuColor: OnuColor;
    onuSignal: OnuSignal;
    maintenances: ViewOnuMaintenanceDto[];
    observation?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ViewOnuMaintenanceDto {
    id: string;
    employee: ViewEmployeeDto;
    detectedProblem: string;
    observation?: string;
    status: OnuMaintenanceStatus;
    signal: OnuSignal;
    date: string;
}