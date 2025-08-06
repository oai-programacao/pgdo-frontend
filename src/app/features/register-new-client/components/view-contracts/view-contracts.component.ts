import { CommonModule } from "@angular/common";
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  inject,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from "@angular/core";
import { ButtonModule } from "primeng/button";
import { RegisterClientService } from "../../services/register-client.service";
import { PopoverModule } from "primeng/popover";
import { InputTextModule } from "primeng/inputtext";
import { InputGroupAddonModule } from "primeng/inputgroupaddon";
import { InputGroup } from "primeng/inputgroup";
import { ProgressSpinner } from "primeng/progressspinner";
import { Router } from "@angular/router";
import { MessageService } from "primeng/api";

@Component({
  selector: "app-view-contracts",
  imports: [
    CommonModule,
    ButtonModule,
    InputGroupAddonModule,
    InputGroup,
    PopoverModule,
    InputTextModule,
    ProgressSpinner,
  ],
  templateUrl: "./view-contracts.component.html",
  styleUrls: ["./view-contracts.component.scss"],
  providers: [RegisterClientService, MessageService, Router],
})
export class ViewContractsComponent implements OnInit, OnChanges {
  @Input() clientData: any[] = [];
  @Input({ required: true }) isPJorPF!: string | null;

  contractsList: any[] = [];
  link!: string;
  isLoadingLink = false;

  messageService = inject(MessageService);
  registerClientService = inject(RegisterClientService);
  cdr = inject(ChangeDetectorRef);
  router = inject(Router);

  registerPdf: string | null = null;
  permanentContractPdf: string | null = null;
  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {
    // console.log("clientData:", this.clientData);
    // console.log("contractsFromRbxAndDb:", this.contractsFromRbxAndDb);
    if (
      this.clientData &&
      this.clientData.length > 0 &&
      Array.isArray(this.clientData[0].contracts)
    ) {
      const onlyWithId = this.clientData[0].contracts.filter(
        (contract: any) => !!contract.id
      );
      if (onlyWithId.length > 0) {
        this.contractsList = onlyWithId;
      }
    } else {
      this.contractsList = [];
    }
  }

  get contractsFromRbxAndDb() {
    return this.clientData[0]?.contracts || [];
  }

  getPaymentByBillet(contractId: string) {
    this.isLoadingLink = true;

    this.registerClientService
      .getclienteContractByIdAdhesionBillet(contractId)
      .subscribe({
        next: (response) => {
          this.link = response;
          this.isLoadingLink = false;
          this.cdr.detectChanges();
          this.messageService.add({
            severity: "success",
            summary: "Sucesso",
            detail: "Boleto gerado com sucesso!",
          });
        },
        error: () => {
          this.isLoadingLink = false;
          this.cdr.detectChanges();
        },
      });
  }

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

  getPlanLabel(codePlan: number | string): string {
    const code = Number(codePlan);
    const plan = [...this.pfPlans, ...this.pjPlans].find(
      (p) => p.value === code
    );
    return plan
      ? `${plan.value} - ${plan.name}`
      : `${codePlan} - Plano Desconhecido`;
  }

  copyToClipboard(link: string) {
    navigator.clipboard.writeText(link).then(() => {
      window.open(link, "_blank");
    });
  }

  getRegisterPdf() {
    const clientId = this.clientData[0]?.id;
    const contractId = this.contractsList[0]?.id;

    this.registerClientService
      .getClientRegisterPdf(clientId, contractId)
      .subscribe({
        next: (response: Blob) => {
          const fileURL = URL.createObjectURL(response);
          this.registerPdf = fileURL;
          window.open(fileURL, "_blank");
        },
        error: (err) => {
          this.registerPdf = null;
          console.error("Erro ao gerar PDF:", err);
        },
      });
  }

  getClientContractPermanantPdf() {
    const clientId = this.clientData[0]?.id;
    const contractId = this.contractsList[0]?.id;
    console.log("clientId:", clientId, "contractId:", contractId);
    console.log("contractId:", contractId);

    this.registerClientService
      .getClientContractPermanantPdf(clientId, contractId)
      .subscribe({
        next: (response: Blob) => {
          const fileURL = URL.createObjectURL(response);
          this.permanentContractPdf = fileURL;
          window.open(fileURL, "_blank");
        },
        error: (e) => {
          this.permanentContractPdf = null;
          console.log(e);
        },
      });
  }
}
