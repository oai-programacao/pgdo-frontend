export interface CreateSystemWarningDto {
    title: string;
    description: string;
}

export interface ViewSystemWarningDto {
    id: string;
    title: string;
    description: string;
    isActive: boolean;
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface UpdateSystemWarningDto {
    title?: string;
    description?: string;
    isActive?: boolean;
}