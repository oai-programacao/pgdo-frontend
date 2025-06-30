export interface CreateRegisterClientDto {
    clientType: 'PF' | 'PJ';
    cpf: string;
    rg: string;
    photoRg?: string;
    cnpj: string;
    birthDate: string;
    companyName: string;
    fantasyName: string;
    stateRegistration: string;
    name: string;
    alias: string;
    addresses: Address;
    ibge: string;
    commercialPhone: string;
    residentialPhone: string;
    mobilePhone: string;
    email: string;
    contract: Contract[];
}

export interface ViewRegisterClientResponseDto {
    id: string;
    clientType: 'PF' | 'PJ';
    cpf?: string;
    rg?: string;
    photoRg?: string;
    cnpj?: string;
    birthDate?: string;
    companyName?: string;
    fantasyName?: string;
    stateRegistration?: string;
    name: string;
    alias?: string;
    addresses: Address[];
    ibge: string;
    commercialPhone: string;
    residentialPhone: string;
    mobilePhone: string;
    email: string;
    contract: Contract[];
}

export interface Address {
    id?: string;
    zipCode: string;
    state: string;
    city: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    district?: string;
    referencePoint?: string;
    addressType?: 'BILLING' | 'INSTALLATION';
    addressLocation?: 'URBAN' | 'RURAL';
}

export interface Contract {
    id?: string;
    dueDay: number;
    planCode: string;
    accessionValue: number;
    address: Address;
}