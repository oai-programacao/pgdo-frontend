import { FormatDurationPipe } from './../../../../shared/pipes/format-duration.pipe';
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
import { TextareaModule } from 'primeng/textarea';
import { DatePickerModule } from 'primeng/datepicker';
import { SignaturePadComponent } from "../../../../shared/components/signature-pad/signature-pad.component";

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
    SignaturePadComponent
],
  templateUrl: "./create-contract.component.html",
  styleUrl: "./create-contract.component.scss",
  providers: [ViaCepService, MessageService],
})
export class CreateContractComponent implements OnInit, OnChanges {
  @Input({ required: true }) isPJorPF!: string | null;
  @Input() clientData: any[] = [];
  isCepLoading: boolean = false;
  signaturePadData: string = '';
  contractForm!: FormGroup;
  fb = new FormBuilder();
  viaCepService = inject(ViaCepService);
  messageService = inject(MessageService);
  contractService = inject(RegisterClientService);
  dueDateOptions: any = Array.from({ length: 30 }, (_, i) => i + 1);

  pfPlans = [
    { name: "100 Megas - R$ 69,90", value: 10694 },
    { name: "200 Megas - R$ 79,90", value: 411 },
    { name: "300 Megas - R$ 89,90", value: 410 },
    { name: "700 Megas - R$ 99,90", value: 510 },
    { name: "750 Megas - R$ 99,90", value: 378 },
    { name: "1 Giga - R$ 249,90", value: 416 },
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
    {label: "Cobrança", value: "BILLING"},
    {label: "Instalação", value: "INSTALLATION"},
  ]
  



  ngOnInit() {
    this.contractForm
      .get("addressInstalation")
      ?.valueChanges.subscribe((val) => {
        this.contractForm.get("addressCobranca")?.patchValue(val);
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log("Cliente Data: ", this.clientData);
    console.log("id", this.clientData?.[0]?.id);
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
          district: 'Normalmente não informado',
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
          district: 'Normalmente não informado',
          referencePoint: this.clientData?.[0]?.addresses?.referencePoint || "",
          addressType:  null,
          addressLocation: null,
          ibge: this.clientData?.[0]?.addresses?.ibge || 3504008,
        },
      });
    }

    if (typeChanged && this.contractForm) {
      this.contractForm.get("clientType")?.setValue(this.isPJorPF);
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
      district: 'Normalmente não informado',
      referencePoint: [this.clientData?.[0]?.addresses?.referencePoint || ""],
      addressType: [null],
      addressLocation: [null],
      ibge: [this.clientData?.[0]?.addresses?.ibge || null ],
    };

    this.contractForm = this.fb.group({
      client: [this.clientData?.[0]?.id ?? null, Validators.required],
      typeClient: ["C"],
      billingCycle: [1],
      signatureContract: [null, Validators.required],
      seller: [null],
      userSeller: [null],
      addressInstalation: this.fb.group(initialAddress),
      addressCobranca: this.fb.group(initialAddress),
      typePlan: ["P"],
      planCode: [null],
      typeItem: ["P"],
      codeItem: this.clientData?.[0]?.contracts?.codeItem || null,
      beginningCollection: [this.clientData?.[0]?.contracts?.beginningCollection || ""],
      bundleCollection: ["N"],
    });
  }

  get isPF(): boolean {
    return this.contractForm.get("clientType")?.value === "PF";
  }

  get isPJ(): boolean {
    return this.contractForm.get("clientType")?.value === "PJ";
  }

  getCep(isContract: boolean): void {
    const cepControlPath = isContract ? "address.zipCode" : "addresses.zipCode";

    const formGroup = isContract ? this.contractForm : this.contractForm;

    const cepRaw = formGroup.get(cepControlPath)?.value;
    const cep = cepRaw?.replace(/\D/g, "");

    if (cep && cep.length === 8) {
      this.isCepLoading = true;

      // Caminho do FormGroup de endereço para facilitar o acesso
      const addressPath = isContract ? "address" : "addresses";

      this.viaCepService.getAddress(cep).subscribe({
        next: (response) => {
          // ====================================================================
          // AQUI ESTÁ A LÓGICA DE VERIFICAÇÃO PRINCIPAL
          // ====================================================================

          // Verificamos se a resposta tem a propriedade "erro"
          if (response.erro) {
            // 1. Se tiver, o CEP é inválido.
            this.messageService.add({
              severity: "warn",
              summary: "CEP não encontrado",
              detail: "O CEP digitado não retornou um endereço válido.",
            });

            // Limpa os campos de endereço para não confundir o usuário com dados antigos,
            // mas mantém o CEP que ele digitou.
            formGroup.get(addressPath)?.patchValue({
              state: "",
              city: "",
              street: "",
              neighborhood: "",
              complement: "", // Corrigido de 'district' para 'complement' se for o caso
              referencePoint: "",
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
            this.contractForm.get("ibge")?.setValue(response.ibge);

            // Foca no campo "número" para o usuário continuar o preenchimento
            // (Esta é uma melhoria de UX opcional)
            document
              .querySelector<HTMLInputElement>(`[formcontrolname="number"]`)
              ?.focus();
          }

          // Finalmente, desativa o loading
          this.isCepLoading = false;
        },
        error: (error) => {
          // Este bloco agora só será chamado para erros de rede reais (ex: sem internet)
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
    // if (this.contractForm.valid) {
      const contractData = {
        ...this.contractForm.value,
        addressInstalation: {
          ...this.contractForm.value.addressInstalation,
          zipCode: this.contractForm.value.addressInstalation.zipCode.replace(/\D/g, ""),
        },
        addressCobranca: {
          ...this.contractForm.value.addressCobranca,
          zipCode: this.contractForm.value.addressCobranca.zipCode.replace(/\D/g, ""),
        },
      }
      
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
    // } else {
    //   this.messageService.add({
    //     severity: "warn",
    //     summary: "Formulário Inválido",
    //     detail: "Por favor, preencha todos os campos obrigatórios.",
    //   });
    // }
  }

  
}
