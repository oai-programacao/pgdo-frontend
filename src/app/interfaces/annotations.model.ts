import { ViewEmployeeDto } from "./employee.model";

export enum AnnotationType {
    VACATION = 'VACATION',
    SICK_LEAVE = 'SICK_LEAVE',
    LEFT_EARLY = 'LEFT_EARLY',
    MISS_WORK = 'MISS_WORK',
    LATE = 'LATE',
}

export const AnnotationTypeLabels: Record<AnnotationType, string> = {
    [AnnotationType.VACATION]: 'Férias',
    [AnnotationType.SICK_LEAVE]: 'Afastamento Médico',
    [AnnotationType.LEFT_EARLY]: 'Saiu Mais Cedo',
    [AnnotationType.MISS_WORK]: 'Faltou ao Trabalho',
    [AnnotationType.LATE]: 'Atraso',
};

export interface CreateAnnotationDto {
    type: AnnotationType;
    description: string;
    startDate: string;
    endDate: string;
    employeeId: string;
}

export interface ViewAnnotationDto {
    id: string;
    type: AnnotationType;
    description: string;
    startDate: string;
    endDate: string;
    durationInSeconds: number; // em segundos
    employee: ViewEmployeeDto;
    creator: ViewEmployeeDto;
    createdAt: string;
    updatedAt: string;
}

