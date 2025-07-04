export interface CreateTechnicianDto {
    name: string;
    email: string;
    rbxUsername?: string; // Opcional
}

export interface UpdateTechnicianDto {
    name?: string;
    email?: string;
    rbxUsername?: string;
    isActive?: boolean;
    isOccupied?: boolean;
}

export interface ViewTechnicianDto {
    id: string;
    name: string;
    email: string;
    rbxUsername: string; // Opcional, se não for sempre retornado
    isActive: boolean;
    role: string;
    createdAt?: string;
    updatedAt?: string;
}


