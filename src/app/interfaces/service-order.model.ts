import { ViewEmployeeDto } from "./employee.model";
import { CommandArea, City, ClientType, TypeOfOs, Period, Technology, ServiceOrderStatus } from "./enums.model";
import { ViewTechnicianDto } from "./technician.model";


export interface PageInfo {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}

export interface CustomPageResponse<T> {
  content: T[];
  page: PageInfo;
}


// Para seu ViewServiceOrderDto (você já deve ter algo similar)
export interface ViewServiceOrderDto {
  helpers: never[];
  id: string; // UUID
  contractNumber?: number;
  identificationNumber?: number;
  clientName: string;
  phone1: string;
  phone2?: string;
  responsiblePerson?: string
  commandArea: CommandArea;
  city: City;
  district: string;
  address: string;
  clientType: ClientType;
  typeOfOs: TypeOfOs;
  scheduleDate?: string;
  period?: Period;
  technology?: Technology;
  technician?: ViewTechnicianDto;
  status?: string; // Ou um enum ServiceOrderStatus
  technicalHelp?: ViewTechnicalHelpDto[];
  unproductiveVisits?: ViewUnproductiveVisits[];
  startOfOs: string;
  endOfOs?: string;
  durationOfOs?: string;
  cabling?: boolean
  observation?: string;
  createdAt: string;
  updatedAt?: string;
  updatedBy?: string;
  isActiveToReport?: boolean; // Se a OS está ativa para relatório
}

// DTO para criar a Ordem de Serviço
export interface CreateServiceOrderDto {
  contractNumber?: number; // int32
  identificationNumber?: number; // int32
  clientName: string;
  phone1: string;
  phone2?: string;
  // responsiblePersonId será pego do usuário logado no backend, conforme seu service anterior
  commandArea: CommandArea;
  city: City;
  district: string;
  address: string;
  clientType: ClientType;
  serviceOrderType: TypeOfOs; // Nome do campo no DTO que você passou
  scheduleDate?: string; // DD/MM/YYYY
  period?: Period;
  technology?: Technology;
}

export interface UpdateServiceOrderDto {
  period?: Period;
  scheduleDate?: string | undefined;
  technology?: Technology;
  technicianId?: string; // ID do técnico
  status?: ServiceOrderStatus; // Status da OS
  cabling?: boolean; // Se é cabeamento ou não
  isActiveToReport?: boolean; // Se a OS está ativa para relatório
  startOfOs?: string; // HH:mm
  endOfOs?: string; // HH:mm
  observation?: string; // Observação da OS
}

export interface CreateServiceOrderHelperDto {
  technicianId: string;
  start: string; // dd/MM/yyyy HH:mm:ss
  end: string; // dd/MM/yyyy HH:mm:ss
}

export interface CreateServiceOrderUnproductiveVisitDto {
  technicianId: string;
  date: string; // dd/MM/yyyy HH:mm:ss
  observation: string; // Observação da visita não produtiva
}

export interface ViewTechnicalHelpDto {
  id: string;
  technician: ViewTechnicianDto;
  startTime: string;
  endTime: string;
  duration: string;
  createdAt: string;
}

export interface ViewUnproductiveVisits {
  id: string;
  technician: ViewTechnicianDto;
  date: string;
  observation: string;
  createdAt: string;
}

export interface ContractDetails {
  Cliente_Nome: string;
  Cliente_Tel_Celular: string;
  Cliente_Tel_Residencial: string;
  EnderecoInstalacao_Cidade: string;
  EnderecoInstalacao_Bairro: string;
  EnderecoInstalacao_Logradouro: string;
  EnderecoInstalacao_Numero: string;
}

export interface ServiceOrderFilters {
  contractNumber?: number | null;
  clientName?: string | null;
  responsiblePersonId?: string | null;
  technicianId?: string | null; 
  startDate?: string | null; 
  endDate?: string | null; 
  cities?: City[] | null;
  typesOfOS?: TypeOfOs[] | null;
  periods?: Period[] | null;
  statuses?: ServiceOrderStatus[] | null;
}
export interface ServiceOrderPage {
  content: ViewServiceOrderDto[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  }
}