export interface ViaCepResponse {
    cep: string; // O CEP completo
    logradouro: string; // Logradouro (rua, avenida, etc.)
    complemento: string; // Complemento do endereço
    bairro: string; // Bairro
    localidade: string; // Cidade
    uf: string; // Unidade Federativa (estado)
    ibge: string; // Código IBGE do município
    gia: string; // Código GIA (Guia de Informação e Apuração do ICMS)
    ddd: string; // Código DDD (Discagem Direta à Distância)
    siafi: string; // Código SIAFI (Sistema Integrado de Administração Financeira)
    erro?: boolean; // Indica se houve erro na consulta
}