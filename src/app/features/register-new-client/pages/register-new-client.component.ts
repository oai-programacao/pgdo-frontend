import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";

// PRIME
import { InputTextModule } from "primeng/inputtext";
import { StepperModule } from "primeng/stepper";
import { ButtonModule } from "primeng/button";
import { IftaLabelModule } from "primeng/iftalabel";
import { SelectModule } from 'primeng/select';
import {  FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import { DatePickerModule } from 'primeng/datepicker';
import { TextareaModule } from 'primeng/textarea';
import { FloatLabel } from 'primeng/floatlabel';
import { SignaturePadComponent } from "../../../shared/components/signature-pad/signature-pad.component";
import { CpfCnpjPipe } from "../../../shared/pipes/cpf-cnpj.pipe";
import { RgPipe } from "../../../shared/pipes/rg.pipe";
import { PhonesPipe } from "../../../shared/pipes/phones.pipe";
import { InputNumberModule } from 'primeng/inputnumber';
import { ViaCepService } from "../../../service/viacep.service";
import { RegisterClientService } from "../services/register-client.service";
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';

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
    NgxMaskDirective
],
  templateUrl: "./register-new-client.component.html",
  styleUrl: "./register-new-client.component.scss",
  providers: [provideNgxMask()]
})
export class RegisterNewClientComponent {
  private readonly viacepService = inject(ViaCepService);
  private readonly registerClientService = inject(RegisterClientService);
  fb!: FormBuilder;
  form!: FormGroup;
  contractForm!: FormGroup;
  planCodes: [] = [];

  constructor() {
    this.fb = inject(FormBuilder);
    this.form = this.fb.group({
      clientType: [null, Validators.required],
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
      }),
      contract: this.fb.array([]),
      ibge: [''],
      commercialPhone: [''],
      residentialPhone: ['', Validators.required],
      mobilePhone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
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

  getCep(isContract: boolean): void {
    const cepRaw = isContract
      ? this.contractForm.get('address.zipCode')?.value
      : this.form.get('addresses.zipCode')?.value;

    const cep = cepRaw?.replace(/\D/g, ''); // Remove traços, espaços, etc.

    if (cep && cep.length === 8) {
      this.viacepService.getAddress(cep).subscribe({
        next: (response) => {
          if (response) {
            const endereco = {
              zipCode: response.cep.replace(/\D/g, ''), // Remove traços, espaços, etc.
              state: response.uf,
              city: response.localidade,
              street: response.logradouro,
              neighborhood: response.bairro,
              district: response.complemento,
              referencePoint: ''
            };

            if (isContract) {
              this.contractForm.get('address')?.patchValue(endereco);
            } else {
              this.form.get('addresses')?.patchValue(endereco);
              this.form.get('ibge')?.setValue(response.ibge);
            }
          } else {
            console.warn("CEP não encontrado.");
          }
        },
        error: (error) => {
          console.error("Erro ao buscar CEP:", error);
        }
      });
    }
  }

  submitRegistration(): void {
    if (this.form.valid) {
      const clientData = this.form.value;
      const addresses = clientData.addresses;

      const test = {
        ...clientData,
        alias: clientData.name,
        addresses: [addresses]
      }

      this.registerClientService.registerClient(test).subscribe({
        next: (response) => {
          console.log("Cliente registrado com sucesso:", response);
          // Aqui você pode redirecionar ou mostrar uma mensagem de sucesso
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
 }
