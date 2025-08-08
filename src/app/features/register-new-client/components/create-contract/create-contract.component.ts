import { FormatDurationPipe } from "./../../../../shared/pipes/format-duration.pipe";
import { CommonModule } from "@angular/common";
import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from "@angular/core";
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { SelectModule } from "primeng/select";
import { InputTextModule } from "primeng/inputtext";
import { InputNumberModule } from "primeng/inputnumber";
import { ViaCepService } from "../../../../service/viacep.service";
import { MessageService } from "primeng/api";
import { RegisterClientService } from "../../services/register-client.service";
import { Button } from "primeng/button";
import { TextareaModule } from "primeng/textarea";
import { DatePickerModule } from "primeng/datepicker";
import { SignaturePadComponent } from "../../../../shared/components/signature-pad/signature-pad.component";
import { GoogleMapsComponent } from "../../../../shared/components/google-maps/google-maps.component";
import { StepperModule } from "primeng/stepper";
import { CodePlans } from "../../../../interfaces/register-client.model";
import { ToastModule } from "primeng/toast";
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: "app-create-contract",
  imports: [
    CommonModule,
    InputNumberModule,
    ReactiveFormsModule,
    SelectModule,
    InputTextModule,
    Button,
    TextareaModule,
    DatePickerModule,
    SignaturePadComponent,
    GoogleMapsComponent,
    StepperModule,
    ToastModule,
    ProgressSpinnerModule
  ],
  templateUrl: "./create-contract.component.html",
  styleUrl: "./create-contract.component.scss",
  providers: [ViaCepService, MessageService],
})
export class CreateContractComponent implements OnInit, OnChanges {
  @Output() contractCreated = new EventEmitter<void>();
  @Input({ required: true }) isPJorPF!: string | null;
  @Input() clientData: any[] = [];
  isCepLoading: boolean = false;
  signaturePadData: string = "";
  contractForm!: FormGroup;
  fb = new FormBuilder();
  isCreatingContract: boolean = false;
  viaCepService = inject(ViaCepService);
  messageService = inject(MessageService);
  contractService = inject(RegisterClientService);
  dueDateOptions: any = Array.from({ length: 30 }, (_, i) => i + 1);
  public addressForMapSearch: any = null;
  stepOne = 1;
  signaturePadComponent!: SignaturePadComponent;
  // Definindo o valor base da adesão como uma propriedade da classe
  readonly valorBaseAdesao = 1000;

  pfPlans: any[] = [
    { Codigo: 9009, Descricao: "9009 - Plano Básico" }
  ];

  pjPlans: any[] = [
    { Codigo: 9009, Descricao: "9009 - Plano Básico" }
  ];

  addressLocationOptions = [
    { label: "Urbano", value: "URBAN" },
    { label: "Rural", value: "RURAL" },
  ];

  addressTypeOptions = [
    { label: "Cobrança", value: "BILLING" },
    { label: "Instalação", value: "INSTALLATION" },
  ];

  installments = [
    { label: "1x", value: 1 },
    { label: "2x", value: 2 },
    { label: "3x", value: 3 },
    { label: "4x", value: 4 },
    { label: "5x", value: 5 },
    { label: "6x", value: 6 },
    { label: "7x", value: 7 },
    { label: "8x", value: 8 },
    { label: "9x", value: 9 },
    { label: "10x", value: 10 },
    { label: "11x", value: 11 },
    { label: "12x", value: 12 },
  ];

  billingCycleOptions: any = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
    22, 23, 24, 25, 26, 27, 28, 29, 30, 31,
  ];

  ngOnInit() {
    this.stepOne = 1;

    if (!this.contractForm) {
      this.buildForm();
    }
    this.contractForm
      .get("addressInstalation")
      ?.valueChanges.subscribe((val) => {
        this.contractForm.get("addressCobranca")?.patchValue(val);
        this.updateAddressForMap(val);
      });

    // Lógica para calcular e mapear os valores de desconto e preço final
    // this.contractForm
    //   .get("subscriptionDiscount")
    //   ?.valueChanges.subscribe((valorDigitadoPeloUsuario) => {
    //     const parcels = this.contractForm.get("parcels") as FormArray;

        // O valor que o usuário digita no campo 'subscriptionDiscount' é o VALOR FINAL (ex: 900)
        // const finalPrice = Number(valorDigitadoPeloUsuario) || 0;

        // Calculamos o DESCONTO a partir do valor final digitado (ex: 1000 - 900 = 100)
        // let discountAmount = this.valorBaseAdesao - finalPrice;

        // Garante que o desconto não seja negativo
        // if (discountAmount < 0) {
        //   discountAmount = 0;
        // }

        // if (parcels && parcels.length > 0) {
          // Mapeamento conforme a sua regra FINAL:
          // 1. 'price' da parcela deve receber o VALOR DO DESCONTO (ex: 100)
          // parcels
          //   .at(0)
          //   .get("price")
          //   ?.setValue(discountAmount, { emitEvent: false });

          // 2. 'subscriptionDiscount' já contém o VALOR FINAL (ex: 900)
          // Não precisamos setar ele aqui, pois o usuário já o alterou no input.
          // O importante é que o 'price' da parcela seja atualizado com o desconto.
  //       }
  //     });
  // }
    }
  ngOnChanges(changes: SimpleChanges): void {
    const clientChanged = changes["clientData"] && this.clientData;
    const typeChanged = changes["isPJorPF"];

    if (clientChanged && !this.contractForm) {
      this.buildForm();
    }

    if (clientChanged && this.contractForm) {
      this.contractForm.patchValue({
        client: this.clientData?.[0]?.id,
        addressInstalation: {
          zipCode: null,
          state: "SP",
          street: null,
          number: null,
          complement: null,
          neighborhood: null,
          district: "Normalmente não informado",
          referencePoint: this.clientData?.[0]?.addresses?.referencePoint || "",
          addressType: "INSTALLATION",
          addressLocation: "",
          ibge: 3504008,
        },
        addressCobranca: {
          zipCode: null,
          state: "SP",
          city: this.clientData?.[0]?.addresses?.city || null,
          street: null,
          number: null,
          complement: null,
          neighborhood: null,
          district: "Normalmente não informado",
          referencePoint: this.clientData?.[0]?.addresses?.referencePoint || "",
          addressType: "INSTALLATION",
          addressLocation: null,
          ibge: this.clientData?.[0]?.addresses?.ibge || 3504008,
        },
      });
    }

    if (typeChanged && this.contractForm) {
      this.contractForm.get("clientType")?.setValue(this.isPJorPF);
    }

    if (this.contractForm) {
      const address = this.contractForm.get("addressInstalation")?.value;
      this.updateAddressForMap(address);
    }
  }

  private updateAddressForMap(address: any) {
    if (address && address.street && address.number && address.city) {
      this.addressForMapSearch = `${address.street}, ${address.number}, ${
        address.neighborhood || ""
      }, ${address.city}`;
    } else {
      this.addressForMapSearch = "";
    }
  }

  // Esta função não é mais usada para o cálculo principal, mas pode ser mantida se tiver outro uso.
  private calculateParcelValueWithDiscount(
    discount: number | null
  ): number | null {
    const baseValue = 1000;
    if (discount == null || isNaN(Number(discount))) return baseValue;
    return baseValue - Number(discount);
  }

  buildForm() {
    // Na inicialização, o usuário não digitou nada, então o 'subscriptionDiscount' é 0.
    // Isso significa que o 'price' da parcela (que é o desconto) é 0.
    // E o 'subscriptionDiscount' (que é o valor final) é o valor base.

    const initialAddress = {
      zipCode: [""],
      state: ["SP"],
      city: [""],
      street: [null],
      number: [null],
      complement: [null],
      neighborhood: [null],
      district: ["Normalmente não informado"],
      referencePoint: [""],
      addressType: ["INSTALLATION"],
      addressLocation: ["", Validators.required],
      ibge: [3504008],
    };

    this.contractForm = this.fb.group({
      client: [this.clientData?.[0]?.id ?? null, Validators.required],
      typeClient: ["C"],
      billingCycle: [null, Validators.required],
      signatureContract: [null, Validators.required],
      seller: [null],
      userSeller: [null],
      addressInstalation: this.fb.group({ ...initialAddress }),
      addressCobranca: this.fb.group({ ...initialAddress }),
      typePlan: ["P"],
      planCode: [null],
      numParcels: [null, Validators.required],
      formPay: ["B"],
      charging: ["S"],
      bankAccount: [33],
      agreement: [566558],
      parcels: this.fb.array([
        this.fb.group({
          description: ["Parcela Adesão"],
          dueDate: [null, Validators.required],
          // 'price' da parcela deve receber o VALOR DO DESCONTO (inicialmente 0)
          price: [null, Validators.required],
        }),
      ]),
      typeItem: ["P"],
      codeItem: [null, Validators.required],
      // 'subscriptionDiscount' deve receber o VALOR FINAL DA ADESÃO (inicialmente 1000)
      subscriptionDiscount: [null, Validators.required],
      beginningCollection: ["", Validators.required],
      bundleCollection: ["N"],
      signaturePad: [null, Validators.required],
    });
  }

  get isPF(): boolean {
    return this.contractForm.get("clientType")?.value === "PF";
  }

  get isPJ(): boolean {
    return this.contractForm.get("clientType")?.value === "PJ";
  }

  get contracts(): FormArray {
    return this.contractForm.get("contract") as FormArray;
  }

  get parcelsControls() {
    return (this.contractForm.get("parcels") as FormArray).controls;
  }

  getCep(isContract: boolean): void {
    const cepControlPath = isContract
      ? "addressInstalation.zipCode"
      : "addressCobranca.zipCode";
    const addressPath = isContract ? "addressInstalation" : "addressCobranca";
    const formGroup = this.contractForm;

    const cepRaw = formGroup.get(cepControlPath)?.value;
    const cep = cepRaw?.replace(/\D/g, "");

    if (cep && cep.length === 8) {
      this.isCepLoading = true;

      this.viaCepService.getAddress(cep).subscribe({
        next: (response) => {
          if (response.erro) {
            this.messageService.add({
              severity: "warn",
              summary: "CEP não encontrado",
              detail: "O CEP digitado não retornou um endereço válido.",
            });

            formGroup.get(addressPath)?.patchValue({
              state: "",
              city: "",
              street: "",
              neighborhood: "",
              complement: "",
              referencePoint: "",
            });
          } else {
            const endereco = {
              state: response.uf,
              city: response.localidade,
              street: response.logradouro,
              neighborhood: response.bairro,
              complement: response.complemento,
            };

            formGroup.get(addressPath)?.patchValue(endereco);
            formGroup.get(addressPath + ".ibge")?.setValue(response.ibge);

            document
              .querySelector<HTMLInputElement>(`[formcontrolname="number"]`)
              ?.focus();
          }
          this.isCepLoading = false;
        },
        error: (error) => {
          this.isCepLoading = false;
          this.messageService.add({
            severity: "error",
            summary: "Erro de Rede",
            detail:
              "Não foi possível conectar ao serviço de CEP. Verifique sua conexão.",
          });
          console.error("Erro de rede ao buscar CEP:", error);
        },
      });
    }
  }

  createNewContract() {
    function formatDateToBackend(date: string): string {
      if (!date) return "";
      if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
      const [day, month, year] = date.split("/");
      return `${year}-${month}-${day}`;
    }

    const parcels = this.contractForm.value.parcels.map((parcel: any) => ({
      ...parcel,
      dueDate: formatDateToBackend(parcel.dueDate),
    }));

    const beginningCollection = formatDateToBackend(
      this.contractForm.value.beginningCollection
    );
    const signatureContract = formatDateToBackend(
      this.contractForm.value.signatureContract
    );

    const contractData = {
      ...this.contractForm.value,
      parcels,
      beginningCollection,
      signatureContract,
      codeItem: this.contractForm.value.codeItem,
      addressInstalation: {
        ...this.contractForm.value.addressInstalation,
        zipCode: this.contractForm.value.addressInstalation.zipCode.replace(
          /\D/g,
          ""
        ),
      },
      addressCobranca: {
        ...this.contractForm.value.addressCobranca,
        zipCode: this.contractForm.value.addressCobranca.zipCode.replace(
          /\D/g,
          ""
        ),
      },
    };

    this.isCreatingContract = true;

    this.contractService.postClientContract(contractData).subscribe({
      next: () => {
        this.contractForm.reset();
        this.contractCreated.emit();
        this.messageService.add({
          severity: "success",
          summary: "Contrato Criado",
          detail: "O contrato foi criado com sucesso.",
        });
        this.isCreatingContract = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: "error",
          summary: "Erro ao Criar Contrato",
          detail: "Ocorreu um erro ao criar o contrato.",
        });
        console.error("Erro ao criar contrato:", error);
      },
    });
  }

  public searchAddressOnMap(): void {
    this.contractForm.get("addressInstalation")?.markAllAsTouched();
    const addressForm = this.contractForm.get("addressInstalation");
    console.log("Endereço para o mapa:", this.addressForMapSearch);

    if (
      !addressForm ||
      !addressForm.get("street")?.value ||
      !addressForm.get("number")?.value ||
      !addressForm.get("city")?.value
    ) {
      this.messageService.add({
        severity: "warn",
        summary: "Dados Incompletos",
        detail:
          "Por favor, preencha pelo menos a rua, número e cidade para pesquisar no mapa.",
      });
      this.addressForMapSearch = null;
      return;
    }
    const addressValue = addressForm.value;
    this.addressForMapSearch = {
      logradouro: addressValue.street,
      numero: addressValue.number,
      bairro: addressValue.neighborhood,
      localidade: addressValue.city,
    };
  }

  getPlanLabel(codePlan: number | string): string {
    const code = Number(codePlan);
    const plan = [...this.pfPlans, ...this.pjPlans].find(
      (p) => p.value === code
    );
    return plan
      ? `${plan.value} - ${plan.name}`
      : `${codePlan} - Plano Desconhecido`;
  }

  submitRegistration(): void {
    if (this.contractForm.valid) {
      const clientData = this.contractForm.value;
      const addresses = clientData.addresses;

      const test = {
        ...clientData,
        alias: clientData.name,
        companyName: clientData.clientType === "PJ" ? clientData.name : null,
        fantasyName: clientData.clientType === "PJ" ? clientData.name : null,
        addresses: [addresses],
      };

      this.contractService.registerClient(test).subscribe({
        next: (response) => {
          // Aqui você pode redirecionar ou mostrar uma mensagem de sucesso
          this.messageService.add({
            severity: "success",
            summary: "Cadastro realizado com sucesso",
            detail: `Cliente ${response.name} cadastrado com sucesso!`,
          });
          this.stepOne = 1; // Reseta o stepper para o início
          this.contractForm.reset();
          this.contracts.clear();
          this.signaturePadData = ""; // Limpa a assinatura
          this.contractForm.get("signaturePad")?.setValue(null); // Limpa o campo de assinatura
          this.signaturePadComponent.clearPad(); // Limpa o pad de assinatura
        },
        error: (error) => {
          console.error("Erro ao registrar cliente:", error);
          // Aqui você pode mostrar uma mensagem de erro
        },
      });
    } else {
      this.contractForm.markAllAsTouched();
    }
  }

  onSignatureDataReceived(signatureData: string): void {
    this.signaturePadData = signatureData;
    this.messageService.add({
      severity: "success",
      summary: "Assinatura Capturada",
      detail: "A assinatura foi capturada com sucesso.",
    });
    this.contractForm.get("signaturePad")?.setValue(signatureData);
  }

  
}