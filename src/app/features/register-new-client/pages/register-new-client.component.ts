import { MessageService } from 'primeng/api';
import { CommonModule } from "@angular/common";
import { Component, inject, OnDestroy, OnInit, ViewChild } from "@angular/core";

// PRIME
import { InputTextModule } from "primeng/inputtext";
import { StepperModule } from "primeng/stepper";
import { ButtonModule } from "primeng/button";
import { IftaLabelModule } from "primeng/iftalabel";
import { SelectModule } from 'primeng/select';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import { DatePickerModule } from 'primeng/datepicker';
import { TextareaModule } from 'primeng/textarea';
import { FloatLabel } from 'primeng/floatlabel';
import { SignaturePadComponent } from "../../../shared/components/signature-pad/signature-pad.component";
import { InputNumberModule } from 'primeng/inputnumber';
import { ViaCepService } from "../../../service/viacep.service";
import { RegisterClientService } from "../services/register-client.service";
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { ToastModule } from 'primeng/toast';
import { GoogleMapsComponent } from "../../../shared/components/google-maps/google-maps.component";
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { FileUpload } from 'primeng/fileupload'; // Importe o FileUpload
import { FileUploadModule } from 'primeng/fileupload';

@Component({
  selector: "app-register-new-client",
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    InputTextModule,
    StepperModule,
    ButtonModule,
    FormsModule,
    IftaLabelModule,
    SelectModule,
    DatePickerModule,
    TextareaModule,
    FloatLabel,
    SignaturePadComponent,
    InputNumberModule,
    NgxMaskDirective,
    ToastModule,
    GoogleMapsComponent,
    IconFieldModule,
    InputIconModule,
    FileUploadModule
],
  templateUrl: "./register-new-client.component.html",
  styleUrl: "./register-new-client.component.scss",
  providers: [provideNgxMask(), MessageService]
})
export class RegisterNewClientComponent {
  private readonly viacepService = inject(ViaCepService);
  private readonly registerClientService = inject(RegisterClientService);
  private readonly messageService = inject(MessageService);
  @ViewChild(SignaturePadComponent) signaturePadComponent!: SignaturePadComponent;
  @ViewChild('fileUpload') fileUpload!: FileUpload;
  fb!: FormBuilder;
  form!: FormGroup;
  contractForm!: FormGroup;
  planCodes: [] = [];
  stepIndex = 1;
  signaturePadData: string = '';
  isCepLoading: boolean = false;
  public addressForMapSearch: any = null;

  constructor() {
    this.fb = inject(FormBuilder);
    this.form = this.fb.group({
      clientType: [null, Validators.required],
      photoRg: [null],
      cpf: [null],
      rg: [null],
      cnpj: [null],
      birthDate: [null, Validators.required],
      companyName: [null],
      fantasyName: [null],
      stateRegistration: [null],
      name: [null, Validators.required],
      alias: [null],
      addresses: this.fb.group({
        zipCode: ['', Validators.required],
        state: [''],
        city: ['', Validators.required],
        street: ['', Validators.required],
        number: ['', Validators.required],
        complement: [''],
        neighborhood: [''],
        district: [''],
        referencePoint: [''],
        addressType: ["BILLING"]
      }),
      contract: this.fb.array([]),
      ibge: [''],
      commercialPhone: [''],
      residentialPhone: ['', Validators.required],
      mobilePhone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      signaturePad: [null, Validators.required],
    });
    

    // Form usado apenas para adicionar contratos
    this.contractForm = this.createContract();
  }

  dueDateOptions: any = [
    1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30
  ]

  pfPlans = [
    { name: '100 Megas - R$ 69,90', value: 412},
    { name: '200 Megas - R$ 79,90', value: 411 },
    { name: '300 Megas - R$ 89,90', value: 410 },
    { name: '700 Megas - R$ 99,90', value: 510 },
    { name: '750 Megas - R$ 99,90', value: 378 },
    { name: '1 Giga - R$ 249,90', value: 416 },
  ]

  pjPlans = [
    { name: '100 Megas Empresarial - R$ 119,90', value: 481 },
    { name: '200 Megas Empresarial - R$ 129,90', value: 485 },
    { name: '300 Megas Empresarial - R$ 139,90', value: 486 },
    { name: '700 Megas Empresarial - R$ 149,90', value: 514 }
  ];

  typePerson: any = [
    {name: "Pessoa Física", value: "PF"},
    {name: "Pessoa Jurídica", value: "PJ"}
  ];

  public searchAddressOnMap(): void {
    // Primeiro, marcamos os campos do endereço como "tocados" para mostrar erros de validação
    this.contractForm.get('address')?.markAllAsTouched();

    // Pegamos a referência para o form group do endereço
    const addressForm = this.contractForm.get('address');

    // Verificamos se os campos necessários (rua, numero, cidade) são válidos
    if (!addressForm || !addressForm.get('street')?.value || !addressForm.get('number')?.value || !addressForm.get('city')?.value) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Dados Incompletos',
        detail: 'Por favor, preencha pelo menos a rua, número e cidade para pesquisar no mapa.',
      });
      this.addressForMapSearch = null; // Garante que o mapa não apareça
      return;
    }

    // Se os dados são válidos, pegamos os valores
    const addressValue = addressForm.value;

    // Populamos nossa variável de controle com o objeto mapeado
    // que o componente do mapa espera.
    this.addressForMapSearch = {
      logradouro: addressValue.street,
      numero: addressValue.number,
      bairro: addressValue.neighborhood,
      localidade: addressValue.city
    };
  }

   /**
   * Converte o arquivo selecionado para BASE64 e o atribui ao form control 'photoRg'.
   * @param event O evento emitido pelo p-FileUpload.
   */
  onUpload(event: any) {
    const file = event.files[0];
    const reader = new FileReader();

    reader.onload = (e: any) => {
      // O resultado é a string em BASE64
      const base64 = e.target.result;
      this.form.patchValue({ photoRg: base64 });
      this.form.get('photoRg')?.markAsDirty();
    };

    // Inicia a leitura do arquivo, que ao ser concluída, acionará o 'onload'
    reader.readAsDataURL(file);
  }

  /**
   * Limpa o valor do campo de imagem e reseta o componente de upload.
   */
  clearImage() {
    this.form.get('photoRg')?.setValue(null);
    this.fileUpload.clear(); // Limpa os arquivos do componente p-FileUpload
  }

  getCep(isContract: boolean): void {
  const cepControlPath = isContract 
    ? 'address.zipCode' 
    : 'addresses.zipCode';
  
  const formGroup = isContract 
    ? this.contractForm 
    : this.form;

  const cepRaw = formGroup.get(cepControlPath)?.value;
  const cep = cepRaw?.replace(/\D/g, '');

  if (cep && cep.length === 8) {
    this.isCepLoading = true;
    
    // Caminho do FormGroup de endereço para facilitar o acesso
    const addressPath = isContract ? 'address' : 'addresses';

    this.viacepService.getAddress(cep).subscribe({
      next: (response) => {
        // ====================================================================
        // AQUI ESTÁ A LÓGICA DE VERIFICAÇÃO PRINCIPAL
        // ====================================================================
        
        // Verificamos se a resposta tem a propriedade "erro"
        if (response.erro) {
          // 1. Se tiver, o CEP é inválido.
          this.messageService.add({
            severity: 'warn',
            summary: 'CEP não encontrado',
            detail: 'O CEP digitado não retornou um endereço válido.'
          });
          
          // Limpa os campos de endereço para não confundir o usuário com dados antigos,
          // mas mantém o CEP que ele digitou.
          formGroup.get(addressPath)?.patchValue({
            state: '',
            city: '',
            street: '',
            neighborhood: '',
            complement: '', // Corrigido de 'district' para 'complement' se for o caso
            referencePoint: ''
          });

        } else {
          // 2. Se não tiver, o CEP é válido. Preenchemos o formulário.
          const endereco = {
            state: response.uf,
            city: response.localidade,
            street: response.logradouro,
            neighborhood: response.bairro,
            complement: response.complemento,
          };
        
          formGroup.get(addressPath)?.patchValue(endereco);
          this.form.get('ibge')?.setValue(response.ibge);
          
          // Foca no campo "número" para o usuário continuar o preenchimento
          // (Esta é uma melhoria de UX opcional)
          document.querySelector<HTMLInputElement>(`[formcontrolname="number"]`)?.focus();
        }
        
        // Finalmente, desativa o loading
        this.isCepLoading = false;
      },
      error: (error) => {
        // Este bloco agora só será chamado para erros de rede reais (ex: sem internet)
        this.isCepLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erro de Rede',
          detail: 'Não foi possível conectar ao serviço de CEP. Verifique sua conexão.'
        });
        console.error("Erro de rede ao buscar CEP:", error);
      }
    });
  }
}

  public clearContractAddress(): void {
    // Limpa todos os campos dentro do form group 'address' do contractForm
    this.contractForm.get('address')?.reset();
    
    // Garante que o mapa também desapareça ao limpar os campos
    this.addressForMapSearch = null;
  }

  submitRegistration(): void {
    if (this.form.valid) {
      const clientData = this.form.value;
      const addresses = clientData.addresses;

      const test = {
        ...clientData,
        alias: clientData.name,
        companyName: clientData.clientType === 'PJ' ? clientData.name : null,
        fantasyName:  clientData.clientType === 'PJ' ? clientData.name : null,
        addresses: [addresses]
      }

      this.registerClientService.registerClient(test).subscribe({
        next: (response) => {
          // Aqui você pode redirecionar ou mostrar uma mensagem de sucesso
          this.messageService.add({
            severity: 'success',
            summary: 'Cadastro realizado com sucesso',
            detail: `Cliente ${response.name} cadastrado com sucesso!`
          })
          this.stepIndex = 1; // Reseta o stepper para o início
          this.form.reset();
          this.contracts.clear();
          this.signaturePadData = ''; // Limpa a assinatura
          this.form.get('signaturePad')?.setValue(null); // Limpa o campo de assinatura
          this.signaturePadComponent.clearPad(); // Limpa o pad de assinatura
        },
        error: (error) => {
          console.error("Erro ao registrar cliente:", error);
          // Aqui você pode mostrar uma mensagem de erro
        }
      });
    } else {
      this.form.markAllAsTouched();
    }


  }
  
  get isPF(): boolean {
    return this.form.get('clientType')?.value === 'PF';
  }

  get isPJ(): boolean {
    return this.form.get('clientType')?.value === 'PJ';
  }

  get contracts(): FormArray {
    return this.form.get('contract') as FormArray;
  }

  addContract(): void {
    if (this.contractForm.valid) {
      const contract = this.fb.group(this.contractForm.value);
      this.contracts.push(contract);
      this.contractForm.reset(); // limpa o form
      this.addressForMapSearch = null; // limpa o endereço do mapa
    } else {
      this.contractForm.markAllAsTouched();
    }
  }

  removeContract(index: number): void {
    this.contracts.removeAt(index);
  }

  private setValidatorsForPF() {
    this.form.get('cpf')?.setValidators([Validators.required]);
    this.form.get('rg')?.setValidators([Validators.required]);
    this.form.get('birthDate')?.setValidators([Validators.required]);

    this.form.get('cnpj')?.clearValidators();
    this.form.get('companyName')?.clearValidators();
    this.form.get('fantasyName')?.clearValidators();
    this.form.get('stateRegistration')?.clearValidators();

    this.updateValidity();
  }

  private setValidatorsForPJ() {
    this.form.get('cnpj')?.setValidators([Validators.required]);
    this.form.get('companyName')?.setValidators([Validators.required]);
    this.form.get('fantasyName')?.setValidators([Validators.required]);
    this.form.get('stateRegistration')?.setValidators([Validators.required]);

    this.form.get('cpf')?.clearValidators();
    this.form.get('rg')?.clearValidators();
    this.form.get('birthDate')?.clearValidators();

    this.updateValidity();
  }

  private updateValidity() {
    const fields = [
      'cpf', 'rg', 'birthDate',
      'cnpj', 'companyName', 'fantasyName', 'stateRegistration'
    ];
    fields.forEach(field => this.form.get(field)?.updateValueAndValidity());
  }

  private createContract(): FormGroup {
    return this.fb.group({
      dueDay: [null, Validators.required],
      planCode: [null, Validators.required],
      accessionValue: [null, Validators.required],
      observation: [''],
      address: this.fb.group({
        zipCode: [''],
        state: [''],
        city: [''],
        street: [''],
        number: [''],
        complement: [''],
        neighborhood: [''],
        district: [''],
        referencePoint: [''],
      })
    });
  }

  getPlanName(planCode: number): string {
    const plan = [...this.pfPlans, ...this.pjPlans].find(p => p.value === planCode);
    return plan ? plan.name : 'Plano Desconhecido';
  }

  onSignatureDataReceived(signatureData: string): void {
    this.signaturePadData = signatureData
    this.messageService.add({
      severity: 'success',
      summary: 'Assinatura Capturada',
      detail: 'A assinatura foi capturada com sucesso.',
    })
    this.form.get('signaturePad')?.setValue(signatureData);
  }
 }
