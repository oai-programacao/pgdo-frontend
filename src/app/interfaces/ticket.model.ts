import { ViewEmployeeDto } from "./employee.model";
import { TicketStatus, TicketTopics } from "./enums.model";

export interface CreateTicketDto {
    description: string;
    topic: TicketTopics;
}

export interface Ticket {
    id: string;
    description: string;
    topic: TicketTopics;
    requestedBy: ViewEmployeeDto;
    resolvedBy?: ViewEmployeeDto;
    resolution?: string;
    status: TicketStatus;
    closedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface UpdateTicketDto {
    status: TicketStatus;
    resolution?: string;
}
