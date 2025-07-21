import { FormatDurationPipe } from "./../../../../shared/pipes/format-duration.pipe";
import { CommonModule } from "@angular/common";
import {
  Component,
  inject,
  Input,
  OnChanges,
  OnInit,
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
  ],
  templateUrl: "./create-contract.component.html",
  styleUrl: "./create-contract.component.scss",
  providers: [ViaCepService, MessageService],
})
export class CreateContractComponent implements OnInit, OnChanges {
  @Input({ required: true }) isPJorPF!: string | null;
  @Input() clientData: any[] = [];
  isCepLoading: boolean = false;
  signaturePadData: string = "";
  contractForm!: FormGroup;
  fb = new FormBuilder();
  viaCepService = inject(ViaCepService);
  messageService = inject(MessageService);
  contractService = inject(RegisterClientService);
  dueDateOptions: any = Array.from({ length: 30 }, (_, i) => i + 1);
  public addressForMapSearch: any = null;

  currentStep = 1;

  pfPlans = [
    { name: "250 Megas - R$ 69,90", value: 9009 },
    { name: "500 Megas - R$ 79,90", value: 10697 },
    { name: "600 Megas - R$ 89,90", value: 10700 },
    { name: "750 Megas - R$ 99,90", value: 10703 },
    { name: "850 Megas - R$ 109,90", value: 10706 },
    { name: "1 Giga - R$ 199,90", value: 10710 },
  ];

  pjPlans = [
    { name: "100 Megas Empresarial - R$ 119,90", value: 481 },
    { name: "200 Megas Empresarial - R$ 129,90", value: 485 },
    { name: "300 Megas Empresarial - R$ 139,90", value: 486 },
    { name: "700 Megas Empresarial - R$ 149,90", value: 514 },
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
    22, 23, 24, 25, 26, 27, 28, 29, 30, 31
  ];

  ngOnInit() {
    if (!this.contractForm) {
      this.buildForm();
    }
    this.contractForm
      .get("addressInstalation")
      ?.valueChanges.subscribe((val) => {
        this.contractForm.get("addressCobranca")?.patchValue(val);
        this.updateAddressForMap(val);
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log("data cliente", this.clientData);
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
          addressType: "",
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
          addressType: null,
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

  

  buildForm() {
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
      addressType: ["", Validators.required],
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
      numParcels: [1, Validators.required],
      formPay: ["B"],
      charging: ["S"],
      bankAccount: [33],
      agreement: [566558],
      parcels: this.fb.array([
        this.fb.group({
          description: [null],
          dueDate: [null, Validators.required],
          price: [null, Validators.required],
        }),
      ]),
      typeItem: ["P"],
      codeItem: [null, Validators.required],
      subscriptionDiscount: [null],
      beginningCollection: ["", Validators.required],
      bundleCollection: ["N"],
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

            // Foca no campo "número" para o usuário continuar o preenchimento
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
    const contractData = {
      ...this.contractForm.value,

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

    this.contractService.postClientContract(contractData).subscribe({
      next: () => {
        this.messageService.add({
          severity: "success",
          summary: "Contrato Criado",
          detail: "O contrato foi criado com sucesso.",
        });
        this.contractForm.reset();
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
  removeContract(index: number): void {
    this.contracts.removeAt(index);
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

  get parcelsControls() {
    return (this.contractForm.get("parcels") as FormArray).controls;
  }

}
