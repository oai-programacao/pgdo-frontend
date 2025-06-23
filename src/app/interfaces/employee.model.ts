export enum EmployeeRole {
    ADMIN = "ADMIN",
    USER = "USER",
    STORE_EMPLOYEE = "STORE_EMPLOYEE",
    STORE_MANAGER = "STORE_MANAGER",
    ANALYST = "ANALYST",
    CDS = "CDS",
    CALL_CENTER = "CALL_CENTER",
    MAINTENANCE = "MAINTENANCE",
}

export interface ViewEmployeeDto {
    id: string;
    name: string;
    email: string;
    rbxUsername?: string; // Opcional, se não for sempre retornado
    role: EmployeeRole;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateEmployeeDto {
    name: string;
    email: string;
    rbxUsername?: string | null;
    role: EmployeeRole;
}

export interface UpdateEmployeeDto {
  name?: string | null;
  email?: string | null;
  rbxUsername?: string | null;
  role?: EmployeeRole | null;
}
