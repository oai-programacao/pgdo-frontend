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

export enum SubTypeServiceOrder {
    // --- Problemas/Sintomas Comuns ---
    SEM_CONEXAO = 'SEM_CONEXAO',
    LENTIDAO = 'LENTIDAO',
    OSCILACAO = 'OSCILACAO',
    PROBLEMA_WIFI = 'PROBLEMA_WIFI',
    FIBRA_ROMPIDA = 'FIBRA_ROMPIDA',
    PROBLEMA_NAO_IDENTIFICADO_NOC = 'PROBLEMA_NAO_IDENTIFICADO_NOC',
    CORRECAO_SINAL_ONU = 'CORRECAO_SINAL_ONU',

    // --- Ações / Solicitações do Cliente ---
    REDE_INTERNA = 'REDE_INTERNA',
    MUDANCA_DE_COMODO = 'MUDANCA_DE_COMODO',
    TROCA_DE_EQUIPAMENTO = 'TROCA_DE_EQUIPAMENTO',
    CONFIGURAR_ROTEADOR = 'CONFIGURAR_ROTEADOR',
    SUPORTE_PREVENTIVO = 'SUPORTE_PREVENTIVO',

    // --- Processos de Negócio ---
    INSTALACAO_CLIENTE_NOVO = 'INSTALACAO_CLIENTE_NOVO',
    INSTALACAO_CLIENTE_BASE = 'INSTALACAO_CLIENTE_BASE',
    MUDANCA_DE_ENDERECO = 'MUDANCA_DE_ENDERECO',
    MIGRACAO_TECNOLOGIA = 'MIGRACAO_TECNOLOGIA',
    RECOLHIMENTO_EQUIPAMENTO = 'RECOLHIMENTO_EQUIPAMENTO',
    RECOLHIMENTO_URGENTE = 'RECOLHIMENTO_URGENTE',
    REATIVACAO_CONEXAO = 'REATIVACAO_CONEXAO',
    VIABILIDADE_TECNICA = 'VIABILIDADE_TECNICA',
    CLIENTE_RECUPERADO = 'CLIENTE_RECUPERADO',
    CLIENTE_DOWNCHURN = 'CLIENTE_DOWNCHURN',
    AMEACA_CANCELAMENTO = 'AMEACA_CANCELAMENTO',

    // --- Processos Internos / Projetos ---
    SERVICOS_INTERNOS_OAI = 'SERVICOS_INTERNOS_OAI',
    MAPEAMENTO_CTO = 'MAPEAMENTO_CTO',
    TROCA_SPLITTER = 'TROCA_SPLITTER',
    LANCAMENTO_CABO = 'LANCAMENTO_CABO',
    SLA_CORPORATIVO = 'SLA_CORPORATIVO',

    // --- Outros ---
    PRIMEIRO_CHAMADO = 'PRIMEIRO_CHAMADO',
    RECLAMACAO_RECORRENTE = 'RECLAMACAO_RECORRENTE',
    REABERTURA_OS = 'REABERTURA_OS',
}

// E adicione este objeto de Labels correspondente
export const SubTypeServiceOrderLabels: Record<SubTypeServiceOrder, string> = {
    [SubTypeServiceOrder.SEM_CONEXAO]: 'Sem Conexão',
    [SubTypeServiceOrder.LENTIDAO]: 'Lentidão',
    [SubTypeServiceOrder.OSCILACAO]: 'Oscilação',
    [SubTypeServiceOrder.PROBLEMA_WIFI]: 'Problema com Wi-Fi',
    [SubTypeServiceOrder.FIBRA_ROMPIDA]: 'Fibra Rompida',
    [SubTypeServiceOrder.PROBLEMA_NAO_IDENTIFICADO_NOC]: 'Problema não Identificado pelo NOC',
    [SubTypeServiceOrder.CORRECAO_SINAL_ONU]: 'Correção de Sinal ONU',
    [SubTypeServiceOrder.REDE_INTERNA]: 'Rede Interna',
    [SubTypeServiceOrder.MUDANCA_DE_COMODO]: 'Mudança de Cômodo',
    [SubTypeServiceOrder.TROCA_DE_EQUIPAMENTO]: 'Troca de Equipamento',
    [SubTypeServiceOrder.CONFIGURAR_ROTEADOR]: 'Configurar Roteador',
    [SubTypeServiceOrder.SUPORTE_PREVENTIVO]: 'Suporte Preventivo',
    [SubTypeServiceOrder.INSTALACAO_CLIENTE_NOVO]: 'Instalação Cliente Novo',
    [SubTypeServiceOrder.INSTALACAO_CLIENTE_BASE]: 'Instalação Cliente da Base',
    [SubTypeServiceOrder.MUDANCA_DE_ENDERECO]: 'Mudança de Endereço',
    [SubTypeServiceOrder.MIGRACAO_TECNOLOGIA]: 'Migração de Tecnologia',
    [SubTypeServiceOrder.RECOLHIMENTO_EQUIPAMENTO]: 'Recolhimento de Equipamento',
    [SubTypeServiceOrder.RECOLHIMENTO_URGENTE]: 'Recolhimento Urgente',
    [SubTypeServiceOrder.REATIVACAO_CONEXAO]: 'Reativação de Conexão',
    [SubTypeServiceOrder.VIABILIDADE_TECNICA]: 'Viabilidade Técnica',
    [SubTypeServiceOrder.CLIENTE_RECUPERADO]: 'Cliente Recuperado',
    [SubTypeServiceOrder.CLIENTE_DOWNCHURN]: 'Cliente Downchurn',
    [SubTypeServiceOrder.AMEACA_CANCELAMENTO]: 'Ameaça de Cancelamento',
    [SubTypeServiceOrder.SERVICOS_INTERNOS_OAI]: 'Serviços Internos OAI',
    [SubTypeServiceOrder.MAPEAMENTO_CTO]: 'Mapeamento de CTO',
    [SubTypeServiceOrder.TROCA_SPLITTER]: 'Troca de Splitter',
    [SubTypeServiceOrder.LANCAMENTO_CABO]: 'Lançamento de Cabo',
    [SubTypeServiceOrder.SLA_CORPORATIVO]: 'SLA Corporativo',
    [SubTypeServiceOrder.PRIMEIRO_CHAMADO]: 'Primeiro Chamado',
    [SubTypeServiceOrder.RECLAMACAO_RECORRENTE]: 'Reclamação Recorrente',
    [SubTypeServiceOrder.REABERTURA_OS]: 'Reabertura de OS',
};

export const TypeToSubTypeMap: Record<TypeOfOs, SubTypeServiceOrder[]> = {
    [TypeOfOs.INSTALLATION]: [
        SubTypeServiceOrder.INSTALACAO_CLIENTE_NOVO,
        SubTypeServiceOrder.INSTALACAO_CLIENTE_BASE,
    ],
    [TypeOfOs.MAINTENANCE]: [
        SubTypeServiceOrder.SEM_CONEXAO,
        SubTypeServiceOrder.LENTIDAO,
        SubTypeServiceOrder.OSCILACAO,
        SubTypeServiceOrder.PROBLEMA_WIFI,
        SubTypeServiceOrder.FIBRA_ROMPIDA,
        SubTypeServiceOrder.PROBLEMA_NAO_IDENTIFICADO_NOC,
        SubTypeServiceOrder.CORRECAO_SINAL_ONU,
        SubTypeServiceOrder.REDE_INTERNA,
        SubTypeServiceOrder.RECLAMACAO_RECORRENTE,
        SubTypeServiceOrder.REABERTURA_OS,
    ],
    [TypeOfOs.CHANGE_OF_ADDRESS]: [
        SubTypeServiceOrder.MUDANCA_DE_ENDERECO,
    ],
    [TypeOfOs.CHANGE_OF_TECHNOLOGY]: [
        SubTypeServiceOrder.MIGRACAO_TECNOLOGIA,
    ],
    [TypeOfOs.PROJECTS]: [
        SubTypeServiceOrder.MAPEAMENTO_CTO,
        SubTypeServiceOrder.TROCA_SPLITTER,
        SubTypeServiceOrder.LANCAMENTO_CABO,
        SubTypeServiceOrder.SLA_CORPORATIVO,
    ],
    [TypeOfOs.KIT_REMOVAL]: [
        SubTypeServiceOrder.RECOLHIMENTO_EQUIPAMENTO,
        SubTypeServiceOrder.RECOLHIMENTO_URGENTE,
    ],
    [TypeOfOs.TECHNICAL_VIABILITY]: [
        SubTypeServiceOrder.VIABILIDADE_TECNICA,
    ],
    [TypeOfOs.TECHNICAL_VISIT]: [
        SubTypeServiceOrder.MUDANCA_DE_COMODO,
        SubTypeServiceOrder.TROCA_DE_EQUIPAMENTO,
        SubTypeServiceOrder.CONFIGURAR_ROTEADOR,
        SubTypeServiceOrder.SUPORTE_PREVENTIVO,
        SubTypeServiceOrder.PRIMEIRO_CHAMADO,
    ],
    [TypeOfOs.INTERNAL]: [
        SubTypeServiceOrder.SERVICOS_INTERNOS_OAI,
    ],
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
  UNDEFINED = 'UNDEFINED',
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
  [ServiceOrderStatus.UNDEFINED]: 'Em Branco',
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
  [ServiceOrderStatus.UNDEFINED]: "success",
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

