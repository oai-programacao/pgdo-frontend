export enum TypeOfOs {
  INSTALLATION = 'INSTALLATION',
  MAINTENANCE = 'MAINTENANCE',
  CHANGE_OF_ADDRESS = 'CHANGE_OF_ADDRESS',
  CHANGE_OF_TECHNOLOGY = 'CHANGE_OF_TECHNOLOGY',
  PROJECTS = 'PROJECTS',
  KIT_REMOVAL = 'KIT_REMOVAL',
  TECHNICAL_VIABILITY = 'TECHNICAL_VIABILITY',
  TECHNICAL_VISIT = 'TECHNICAL_VISIT',
  INTERNAL = 'INTERNAL',
}

export const TypeOfOsLabels: Record<TypeOfOs, string> = {
  [TypeOfOs.INSTALLATION]: 'Instalação',
  [TypeOfOs.MAINTENANCE]: 'Manutenção',
  [TypeOfOs.CHANGE_OF_ADDRESS]: 'Mudança de Endereço',
  [TypeOfOs.CHANGE_OF_TECHNOLOGY]: 'Mudança de Tecnologia',
  [TypeOfOs.PROJECTS]: 'Projetos',
  [TypeOfOs.KIT_REMOVAL]: 'Retirada de Kit',
  [TypeOfOs.TECHNICAL_VIABILITY]: 'Viabilidade Técnica',
  [TypeOfOs.TECHNICAL_VISIT]: 'Visita Técnica',
  [TypeOfOs.INTERNAL]: 'Interno',
};

export enum CommandArea {
  CONTROL_TOWER = "CONTROL_TOWER",
  NOC = "NOC",
  CALL_CENTER = "CALL_CENTER",
  RETENTION_RECUPERATION = "RETENTION_RECUPERATION",
  SALES = "SALES",
  PDVA = "PDVA",
}

export const CommandAreaLabels: Record<CommandArea, string> = {
  [CommandArea.CONTROL_TOWER]: 'Torre de Controle',
  [CommandArea.NOC]: 'NOC',
  [CommandArea.CALL_CENTER]: 'Call Center',
  [CommandArea.RETENTION_RECUPERATION]: 'Recuperação e Retenção',
  [CommandArea.SALES]: 'Vendas',
  [CommandArea.PDVA]: 'PDVA',
}

export enum ClientType {
  B2B = "B2B",
  B2B_SPECIAL = "B2B_SPECIAL",
  B2C = "B2C",
  B2G = "B2G",
  INTERN = "INTERN",
  TEMPORARY = "TEMPORARY",
  CONDOMINIUM = "CONDOMINIUM",
}

export const ClientTypeLabels: Record<ClientType, string> = {
  [ClientType.B2B]: 'B2B',
  [ClientType.B2B_SPECIAL]: 'B2B Especial',
  [ClientType.B2C]: 'B2C',
  [ClientType.B2G]: 'B2G',
  [ClientType.INTERN]: 'Interno',
  [ClientType.TEMPORARY]: 'Temporário',
  [ClientType.CONDOMINIUM]: 'Condomínio',
};


export enum Technology {
  FIBER_OPTIC = 'FIBER_OPTIC',
  RADIO = 'RADIO',
}

export const TechnologyLabels: Record<Technology, string> = {
  [Technology.FIBER_OPTIC]: 'Fibra Óptica',
  [Technology.RADIO]: 'Rádio',
};

export enum City {
  ASSIS = 'ASSIS',
  CANDIDO_MOTA = 'CANDIDO_MOTA',
  PALMITAL = 'PALMITAL',
  OSCAR_BRESSANE = 'OSCAR_BRESSANE',
  IBIRAREMA = 'IBIRAREMA',
  ECHAPORA = 'ECHAPORA',
}

export const CitiesLabels: Record<City, string> = {
    [City.ASSIS]: 'Assis',
    [City.CANDIDO_MOTA]: 'Cândido Mota',
    [City.PALMITAL]: 'Palmital',
    [City.OSCAR_BRESSANE]: 'Oscar Bressane',
    [City.IBIRAREMA]: 'Ibirarema',
    [City.ECHAPORA]: 'Echaporã',
};

export enum Period {
    MORNING = 'MORNING',
    AFTERNOON = 'AFTERNOON',
    NIGHT = 'NIGHT',
}

export const PeriodLabels: Record<Period, string> = {
    [Period.MORNING]: 'Manhã',
    [Period.AFTERNOON]: 'Tarde',
    [Period.NIGHT]: 'Noite',
};


export enum OfferStatus {
    USED = 'USED',
    AVAILABLE = 'AVAILABLE',
    REJECTED = 'REJECTED',
    PENDING = 'PENDING',
    EXPIRED = 'EXPIRED',
}

export const OfferStatusLabels: Record<OfferStatus, string> = {
    [OfferStatus.USED]: 'Utilizada',
    [OfferStatus.AVAILABLE]: 'Disponível',
    [OfferStatus.REJECTED]: 'Rejeitada',
    [OfferStatus.PENDING]: 'Pendente',
    [OfferStatus.EXPIRED]: 'Expirada',
};

export enum ServiceOrderStatus {
  EXECUTED = 'EXECUTED',
  IN_PRODUCTION = 'IN_PRODUCTION',
  CANCELED = 'CANCELED',
  RESCHEDULED = 'RESCHEDULED',
  TARGETED = 'TARGETED',
  PARTIALLY_EXECUTED = 'PARTIALLY_EXECUTED',
  RESCHEDULED_PENDING = 'RESCHEDULED_PENDING',
  TECHNICAL_INFEASIBILITY = 'TECHNICAL_INFEASIBILITY',
  NORMALIZED = 'NORMALIZED',

}

export const ServiceOrderStatusLabels: Record<ServiceOrderStatus, string> = {
  [ServiceOrderStatus.EXECUTED]: 'Executado', 
  [ServiceOrderStatus.IN_PRODUCTION]: 'Em Produção',
  [ServiceOrderStatus.CANCELED]: 'Cancelado',
  [ServiceOrderStatus.RESCHEDULED]: 'Reagendado',
  [ServiceOrderStatus.TARGETED]: 'OS Direcionada',
  [ServiceOrderStatus.PARTIALLY_EXECUTED]: 'Parcialmente Executado',
  [ServiceOrderStatus.RESCHEDULED_PENDING]: 'Reagedamento Pendente',
  [ServiceOrderStatus.TECHNICAL_INFEASIBILITY]: 'Inviabilidade Técnica',
  [ServiceOrderStatus.NORMALIZED]: 'Normalizado',
}

export const ServiceOrderStatusSeverity: Record<ServiceOrderStatus, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
  [ServiceOrderStatus.EXECUTED]: 'success',
  [ServiceOrderStatus.IN_PRODUCTION]: 'info',
  [ServiceOrderStatus.CANCELED]: 'danger',
  [ServiceOrderStatus.RESCHEDULED]: 'warn',
  [ServiceOrderStatus.TARGETED]: 'info',
  [ServiceOrderStatus.PARTIALLY_EXECUTED]: 'warn',
  [ServiceOrderStatus.RESCHEDULED_PENDING]: 'warn',
  [ServiceOrderStatus.TECHNICAL_INFEASIBILITY]: 'danger',
  [ServiceOrderStatus.NORMALIZED]: 'success',
};

export enum TicketTopics {
  IT_SUPPORT = 'IT_SUPPORT',
  ELECTRICAL = 'ELECTRICAL',
  FURNITURE = 'FURNITURE',
  PLUMBING = 'PLUMBING',
  DOORS_AND_GATES = 'DOORS_AND_GATES',
  GENERAL_MAINTENANCE = 'GENERAL_MAINTENANCE',
  CLEANING = 'CLEANING',
  SECURITY = 'SECURITY',
  HVAC = 'HVAC',
  MOVING_AND_SETUP = 'MOVING_AND_SETUP',
}

export const TicketTopicsLabels: Record<TicketTopics, string> = {
  [TicketTopics.IT_SUPPORT]: 'Suporte de TI',
  [TicketTopics.ELECTRICAL]: 'Elétrico',
  [TicketTopics.FURNITURE]: 'Móveis',
  [TicketTopics.PLUMBING]: 'Hidráulico',
  [TicketTopics.DOORS_AND_GATES]: 'Portas e Portões',
  [TicketTopics.GENERAL_MAINTENANCE]: 'Manutenção Geral',
  [TicketTopics.CLEANING]: 'Limpeza',
  [TicketTopics.SECURITY]: 'Segurança',
  [TicketTopics.HVAC]: 'HVAC',
  [TicketTopics.MOVING_AND_SETUP]: 'Mudança e Montagem',
};

export const TicketTopicsDescriptions: Record<TicketTopics, string> = {
  [TicketTopics.IT_SUPPORT]: 'Problemas com computadores, impressoras, rede, monitores.',
  [TicketTopics.ELECTRICAL]: 'Troca de lâmpadas, disjuntores, tomadas, fiação.',
  [TicketTopics.FURNITURE]: 'Solicitações de montagem, reparo ou substituição de móveis.',
  [TicketTopics.PLUMBING]: 'Problemas com encanamentos, vazamentos e instalações hidráulicas.',
  [TicketTopics.DOORS_AND_GATES]: 'Manutenção e reparo de portas, portões e fechaduras.',
  [TicketTopics.GENERAL_MAINTENANCE]: 'Manutenção geral, pintura, pequenos reparos.',
  [TicketTopics.CLEANING]: 'Solicitações de limpeza e conservação de ambientes.',
  [TicketTopics.SECURITY]: 'Câmeras, alarmes, sistemas de segurança.',
  [TicketTopics.HVAC]: 'Instalação e manutenção de sistemas de aquecimento, ventilação e ar-condicionado.',
  [TicketTopics.MOVING_AND_SETUP]: 'Serviços de mudança e montagem de equipamentos ou móveis.',
}

export enum TicketStatus {
  OPEN = 'OPEN',
  EXECUTED = 'EXECUTED',
  CANCELED = 'CANCELED',
}

export const TicketStatusLabels: Record<TicketStatus, string> = {
  [TicketStatus.OPEN]: 'Aberto',
  [TicketStatus.EXECUTED]: 'Executado',
  [TicketStatus.CANCELED]: 'Cancelado',
};

