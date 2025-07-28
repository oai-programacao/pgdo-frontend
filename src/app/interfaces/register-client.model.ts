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
[x: string]: any;
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
    clientPhoneComercial: string;
    residentialPhone: string;
    clientMobilePhone: string;
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

export interface CodePlans{
    Codigo: string;
    Descricao: string;
    Grupo?: string;
}

export interface ClientContract {
  id: string
  client: string
  cpfClient: string
  clientName: string
  typeClient: string
  billingCycle: number
  signatureContract: string
  ViewRegisterClientResponseDto: ViewRegisterClientResponseDto;
  seller: any
  userSeller: any
  addressInstalation: AddressInstalation
  addressCobranca: AddressCobranca
  typePlan: string
  codePlan: number
  numParcels: number
  formPay: string
  charging: string
  bankAccount: number
  agreement: number
  parcels: Parcel[]
  typeItem: string
  codeItem: any
  subscriptionDiscount: number
  beginningCollection: string
  bundleCollection: string
  createAt: string
  confirmInstallation: string
}

export interface AddressInstalation {
  zipCode: number
  state: string
  city: string
  street: string
  number: string
  complement: string
  neighborhood: string
  district: string
  referencePoint: string
  addressType: string
  addressLocation: string
  ibge: string
}

export interface AddressCobranca {
  zipCode: number
  state: string
  city: string
  street: string
  number: string
  complement: string
  neighborhood: string
  district: string
  referencePoint: string
  addressType: string
  addressLocation: string
  ibge: string
}

export interface Parcel {
  description: string
  dueDate: string
  price: number
}

  


export interface ContactAttemptResponse {
  id: string;
  contractId: string;
  contractClientName: string;
  status: string;
  attempts: number;
  lastAttemptedByName: string | null;
  lastAttemptedAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface Attempt{
  id: string;
  contactAfterSaleId: string;
  attemptedByName: string;
  outcomer: string;
  attemptTimestamp: string;
  attemptNotes: string;
  createdAt: string;
}