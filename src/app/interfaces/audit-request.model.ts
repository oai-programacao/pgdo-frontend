export interface AuditRequestDTO {
  typeFlow: string;
  cpf?: string;
  nomeCliente?: string;
}

export interface AuditSearchClientDTO {
  cpf: string;
  nomeCliente: string;
}

export interface AuditFlowResponseDTO {
  id: number;
  emailSeller: string;
  nameSeller: string;
  cpfClientSearch: string;
  nameClientSearch: string;
  typeFlow: string;
  executedIn: string;
}

export interface AuditFlowFilterDTO {
  nameSeller: string;
  cpfClientSearch: string;
  typeFlow: string | null;
  dataInicio: Date | null;
  dataFim: Date | null;
}