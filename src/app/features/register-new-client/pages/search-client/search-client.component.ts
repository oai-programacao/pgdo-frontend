import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { ButtonModule } from "primeng/button";
import { StepperModule } from "primeng/stepper";
import { InputTextModule } from "primeng/inputtext";
import { RegisterClientService } from "../../services/register-client.service";
import { tap } from "rxjs/operators";
import { ProgressSpinnerModule } from "primeng/progressspinner";
import { FormsModule } from "@angular/forms";
import { SelectModule } from "primeng/select";
import { InputMaskModule } from "primeng/inputmask";
import { Router, RouterModule } from '@angular/router';
import { PhonesPipe } from "../../../../shared/pipes/phones.pipe";
import { NgxMaskDirective, provideNgxMask } from "ngx-mask";
import { ClientSharedService } from "../../services/client-shared.service";
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from "primeng/api";
import { DialogModule } from 'primeng/dialog';
import { CreateContractComponent } from "../../components/create-contract/create-contract.component";
import { TooltipModule } from 'primeng/tooltip';

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
    TooltipModule
],
  templateUrl: "./search-client.component.html",
  styleUrl: "./search-client.component.scss",
  providers: [provideNgxMask(), MessageService, ConfirmationService, RegisterClientService]
})
export class SearchClientComponent implements OnInit {
  isLoading = false;
  cpfCnpj: string = "";
  clientType: "PF" | "PJ" | null = null;
  dataClient: any[] = [];
  clientTypeOptions = [
    { label: "Pessoa Física", value: "PF" },
    { label: "Pessoa Jurídica", value: "PJ" },
  ];

  hasSearched = false;

  registerClientService = inject(RegisterClientService);
  clientSharedService = inject(ClientSharedService);
  router = inject(Router)
  confirmationService = inject(ConfirmationService);
  messageService = inject(MessageService);

  // Dialog
  createNewContractDialog = false;

  ngOnInit() {
  }


  createNewContractVisible(client: any){
    this.dataClient = client ? [client] : [];
    this.createNewContractDialog = true;
  }

  onClientTypeChange(){
    this.cpfCnpj = "";
    this.dataClient = [];
  }


  viewClient(client: any){
    this.clientSharedService.setClientData({...client, contract: client.contract});
    this.router.navigate(['/app/cliente-cadastrar'])
  }

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
  this.confirmationService.confirm({
    target: event?.target as EventTarget,
    message: 'Deseja registrar um novo cliente?',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      const clientData: any = {
        cpf: this.clientType === 'PF' ? cpfCnpj : null,
        cnpj: this.clientType === 'PJ' ? cpfCnpj : null,
        clientType: this.clientType
      };
      this.clientSharedService.setClientData(clientData);
      this.router.navigate(['/app/cliente-cadastrar']);
    },
    reject: () => {
      this.messageService.add({
        severity: 'info',
        summary: 'Registrar Cliente',
        detail: 'Ação cancelada.'
      });
      this.hasSearched = false;
    }
  });
}

  registerNewClient(){
    if(!this.cpfCnpj || !this.clientType) return;
    this.registerClientService.getFindOrCreateOnRBX(this.cpfCnpj).subscribe({
      next: (client) => {
        if(client.id){
          this.clientSharedService.setClientData(client);
          this.dataClient = [client];
          return true;
        } 
        return false;
      },
      error: (e) => {
        console.error(e);
      }
    })

  }


}
