export interface GenerateBillPixDto {
    documentos: string[];
    pixGerado: string[];
    clienteId: string;
}

export interface PixResponse {
    id: string;
    txid: string;
    valor: number;
    vencimento: string;
    infoPagador: string;
    nomeCliente: string;
    textoImagemQRcode: string;
    pixResponse: boolean;
}

export interface ClientDataResponse {
    clienteIdApiPix: any;
    codigo: number;
    tipo: string;
    cpfCnpj: string;
    nome: string;
    situacao: string;
    email: string;
    endereco: string;
    bairro: string;
    cidade: string;
    celular: string;
    telefone: string;
}

export interface ContractDataResponse {
    codigoCliente: number;
    nomeCliente: string;
    numeroContrato: string;
    planoDescricao: string;
    situacaoContrato: string;
    valorLiquido: string;
    endereco: string;
    enderecoNumero: string;
    enderecoComplemento: string;
    enderecoBairro: string;
    enderecoCidade: string;
    mensalidadesEmAberto: UnpaidBillsResponse[];
}

export interface UnpaidBillsResponse {
    vencimento: string;
    historico: string;
    documento: number;
    origem: string;
    valor: string;
    tipo: string;
    codigoCliente: number;
    codigoBanco: number;
    nossoNumero: number;
    contrato: string;
    sequencia: number;
    registrado: string;
    boletoPdfLink: string;
    informeAtivo: any;
    idApiPix: string;
}

export interface SearchClientFinancialResponse {
    clienteDados: ClientDataResponse;
    contratoDados: ContractDataResponse[];
}