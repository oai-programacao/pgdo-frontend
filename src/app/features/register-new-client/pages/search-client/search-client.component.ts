import { CommonModule } from "@angular/common";
import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { ButtonModule } from "primeng/button";
import { StepperModule } from "primeng/stepper";
import { InputTextModule } from "primeng/inputtext";
import { RegisterClientService } from "../../services/register-client.service";
import { takeUntil, tap } from "rxjs/operators";
import { ProgressSpinnerModule } from "primeng/progressspinner";
import { FormsModule } from "@angular/forms";
import { SelectModule } from "primeng/select";
import { InputMaskModule } from "primeng/inputmask";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { PhonesPipe } from "../../../../shared/pipes/phones.pipe";
import { NgxMaskDirective, provideNgxMask } from "ngx-mask";
import { ClientSharedService } from "../../services/client-shared.service";
import { ConfirmPopupModule } from "primeng/confirmpopup";
import { ToastModule } from "primeng/toast";
import { ConfirmationService, MessageService } from "primeng/api";
import { DialogModule } from "primeng/dialog";
import { CreateContractComponent } from "../../components/create-contract/create-contract.component";
import { TooltipModule } from "primeng/tooltip";
import { ViewContractsComponent } from "../../components/view-contracts/view-contracts.component";
import { CpfCnpjPipe } from "../../../../shared/pipes/cpf-cnpj.pipe";
import { Subject, Subscription } from "rxjs";
// import { SseService } from "../../../../core/sse/sse.service";
import { FieldsetModule } from "primeng/fieldset";
import { TableModule } from "primeng/table";
import { ShowOffersListComponent } from "../../../offers/components/show-offers-list/show-offers-list.component";
import { CreateRequestOfferComponent } from "../../../offers/components/create-request-offer/create-request-offer.component";

@Component({
  selector: "app-search-client",
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    StepperModule,
    InputTextModule,
    ProgressSpinnerModule,
    FormsModule,
    SelectModule,
    InputMaskModule,
    NgxMaskDirective,
    PhonesPipe,
    ConfirmPopupModule,
    ToastModule,
    DialogModule,
    CreateContractComponent,
    TooltipModule,
    ViewContractsComponent,
    CpfCnpjPipe,
    FieldsetModule,
    TableModule,
    ShowOffersListComponent,
    CreateRequestOfferComponent,
  ],
  templateUrl: "./search-client.component.html",
  styleUrl: "./search-client.component.scss",
  providers: [
    provideNgxMask(),
    MessageService,
    ConfirmationService,
    RegisterClientService,
  ],
})
export class SearchClientComponent implements OnInit, OnDestroy {
  isLoading = false;
  cpfCnpj: string = "";
  clientType: "PF" | "PJ" | null = null;
  dataClient: any[] = [];
  clientTypeOptions = [
    { label: "Pessoa Física", value: "PF" },
    { label: "Pessoa Jurídica", value: "PJ" },
  ];

  private queryParamsSubscription: Subscription | undefined;

  hasSearched = false;
  registerClientService = inject(RegisterClientService);
  clientSharedService = inject(ClientSharedService);
  confirmationService = inject(ConfirmationService);
  messageService = inject(MessageService);
  public showDataClientDialog = false;
  showOffersDialog = false;
  offers: any[] = [];
  isLoadingOffers = false;
  constructor(private router: Router, private route: ActivatedRoute) {}

  // Dialog
  createNewContractDialog = false;
  viewContractsDialog = false;

  private destroy$ = new Subject<void>();

  onDialogHide() {
    this.dataClient = [];
    this.viewContractsDialog = false;
  }

  public openWatchDataDialog(client: any) {
    this.dataClient = client ? [client] : [];
    this.showDataClientDialog = true;
  }

  ngOnInit() {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        const type = params["type"];
        const document = params["document"];
        if (type && document) {
          this.clientType = type;
          this.cpfCnpj = document;
          this.consultClient();
        }
        this.clientType = type;
        this.cpfCnpj = document;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  createdContract() {
    this.createNewContractDialog = false;

    this.consultClient();
    this.messageService.add({
      severity: "success",
      summary: "Contrato Criado",
      detail: "O contrato foi criado com sucesso!",
    });
  }

  createNewContractVisible(client: any) {
    this.dataClient = client ? [client] : [];
    this.createNewContractDialog = true;
  }

  viewContractsDialogVisible(client: any) {
    this.dataClient = client ? [client] : [];
    this.viewContractsDialog = true;

    if (!client.contract) {
      const clientCpfCnpj = (client.cpf || client.cnpj || "").replace(
        /\D/g,
        ""
      );
      if (clientCpfCnpj) {
        this.registerClientService.postSyncContracts(clientCpfCnpj).subscribe({
          next: () => {
            this.consultClient();
          },
          error: (e) => {
            console.log(e);
          },
        });
      }
    }
  }

  onClientTypeChange() {
    this.cpfCnpj = "";
    this.dataClient = [];
  }

  // viewClient(client: any) {
  //   this.clientSharedService.setClientData({
  //     ...client,
  //     contract: client.contract,
  //   });
  //   this.router.navigate(["/app/clientes/cliente-cadastrar"]);
  // }

  consultClient() {
    if (!this.cpfCnpj || !this.clientType) return;

    const cpfCnpjLimpo = this.cpfCnpj.replace(/\D/g, "");

    this.isLoading = true;
    this.registerClientService
      .getAllRegisteredClients(0, 10, undefined, undefined)
      .pipe(
        tap({
          next: () => {
            this.isLoading = false;
          },
          error: () => {
            this.isLoading = false;
          },
        })
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.dataClient = (response.content || []).filter((client) =>
            this.clientType === "PF"
              ? client.cpf?.replace(/\D/g, "") === cpfCnpjLimpo
              : client.cnpj?.replace(/\D/g, "") === cpfCnpjLimpo
          );

          this.hasSearched = true;
        },
        error: (e) => {
          console.log(e);
        },
      });
  }

  confirmToRegisterNewClient(event: Event, cpfCnpj: string) {
    console.log("Tipo:", this.clientType, "CPF/CNPJ:", cpfCnpj); // debug
    if (!cpfCnpj || !this.clientType) {
      this.messageService.add({
        severity: "warn",
        summary: "Dados inválidos",
        detail: "Informe o CPF ou CNPJ e selecione o tipo de cliente.",
      });
      return;
    }
    this.confirmationService.confirm({
      target: event?.target as HTMLElement,
      message: "Deseja registrar um novo cliente?",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
       
      
      },
      reject: () => {
        this.messageService.add({
          severity: "info",
          summary: "Registrar Cliente",
          detail: "Ação cancelada.",
        });
        this.hasSearched = false;
      },
    });
  }

  registerNewClient() {
    if (!this.cpfCnpj || !this.clientType) return;
    this.registerClientService
      .getFindOrCreateOnRBX(this.cpfCnpj)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (client) => {
          if (client.id) {
            this.clientSharedService.setClientData(client);
            this.dataClient = [client];
            return true;
          }
          return false;
        },
        error: (e) => {
          console.error(e);
        },
      });
  }

  validarCPF(cpf: string): boolean {
    if (!cpf) return false;
    cpf = cpf.replace(/\D/g, '');

    // tamanho e todos dígitos iguais
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

    let soma = 0, peso = 10;
    for (let i = 0; i < 9; i++) soma += parseInt(cpf[i], 10) * peso--;
    const digito1 = soma % 11 < 2 ? 0 : 11 - (soma % 11);

    soma = 0; peso = 11;
    for (let i = 0; i < 10; i++) soma += parseInt(cpf[i], 10) * peso--;
    const digito2 = soma % 11 < 2 ? 0 : 11 - (soma % 11);

    return cpf[9] === String(digito1) && cpf[10] === String(digito2);
  }

  validarCnpj(cnpj: string): boolean {
    if (!cnpj) return false;
    cnpj = cnpj.replace(/\D/g, '');
    if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;

    const peso1 = [5,4,3,2,9,8,7,6,5,4,3,2];
    const peso2 = [6,5,4,3,2,9,8,7,6,5,4,3,2];

    let soma = peso1.reduce((acc, val, i) => acc + parseInt(cnpj[i],10) * val, 0);
    const digito1 = soma % 11 < 2 ? 0 : 11 - (soma % 11);

    soma = peso2.reduce((acc, val, i) => acc + parseInt(cnpj[i],10) * val, 0);
    const digito2 = soma % 11 < 2 ? 0 : 11 - (soma % 11);

    return cnpj[12] === String(digito1) && cnpj[13] === String(digito2);
  }

  get cpfCnpjValido(): boolean {
    if (this.clientType === 'PF') return this.validarCPF(this.cpfCnpj);
    if (this.clientType === 'PJ') return this.validarCnpj(this.cpfCnpj);
    return false;
  }
}
