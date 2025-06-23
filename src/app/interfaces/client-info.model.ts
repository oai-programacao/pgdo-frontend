
export interface DataClient {
    AvisoPagamento: string;
    Bairro: string;
    BcoCobr: number;
    Bloqueavel: string;
    CEP: string;
    CNPJ_CNPF: string;
    Cidade: string;
    Cobr_Bairro: string;
    Cobr_CEP: string;
    Cobr_Cidade: string;
    Cobr_Complemento: string;
    Cobr_Endereco: string;
    Cobr_UF: string;
    Cobranca: string;
    CodCobr: string;
    Codigo: string;
    Complemento: string;
    DiaCobr: number;
    DiasProtesto: number;
    Distrito: string;
    Email: string;
    Endereco: string;
    Grupo: number;
    Inclusao: string;
    MapsMarkLat: string;
    MapsMarkLng: string;
    Nascimento: string;
    Nome: string;
    Numero: number;
    Observacoes: string;
    RG_IE: string;
    Sigla: string;
    Situacao: string;
    TelCelular: string;
    TelComercial: string;
    TelResidencial: string;
    Tipo: string;
    TipoImpressao: string;
    UF: string;
    usuario: string;
    dateSignature: string;
}

export interface DataClients {
    result: DataClient[];
}

export interface DadosAgrupadosCliente {
    dados: DadosDoCliente;
    contratos: DadosDoContrato[];
    autenticacoes: DadosAutenticacao[];
    analises?: DadosAnalise[];
}

export interface DadosAnalise {
    analysisName: string;
    result: string;
}

export interface DadosDoCliente {
    codigo: number;
    nome: string;
    email: string;
    cpfCnpj: string;
    telefones: string[];
    situacao: string;
}

export interface DadosDoContrato {
    numero: number;
    codigoPlano: number;
    descricaoPlano: string;
    situacao: string;
    valor: number;
    endereco: string;
    atendimentosPorContrato: DadosAtendimento[];
}

export interface DadosAtendimento {
    numero: number;
    protocolo: number;
    abertura: string;
    usuario: string;
    situacaoOs: string;
    topico: string;
    assunto: string;
    solucao: string;
    encerramento: string;
    causaEncerramento: string;
    tipoAtendimento: string;
    codigoCliente: number;
}

export interface DadosAutenticacao {
    session_id: string;
    customer_id: string;
    customer_name: string;
    contract_id: string;
    plan_id: string;
    plan_description: string;
    authentication_username: string;
    framed_ipv4_address: string;
    session_start_time: string;
    session_up_time: string;
    calling_station_id: string;
}
