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
],
  templateUrl: "./search-client.component.html",
  styleUrl: "./search-client.component.scss",
  providers: [provideNgxMask(),]
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

  registerClientService = inject(RegisterClientService);
  clientSharedService = inject(ClientSharedService);
  router = inject(Router)
  
  ngOnInit() {}


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

        },
        error: (e) => {
          console.log(e);
        },
      });
  }




}
