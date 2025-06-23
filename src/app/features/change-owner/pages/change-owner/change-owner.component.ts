import { Component, ElementRef, ViewChild } from '@angular/core';
import { SearchOwnersComponent } from "../../components/search-owners/search-owners.component";
import { NewOwnerContractExampleComponent } from "../../components/new-owner-contract-example/new-owner-contract-example.component";
import { OldOwnerContractExampleComponent } from "../../components/old-owner-contract-example/old-owner-contract-example.component";
import { DataClient } from '../../../../interfaces/client-info.model';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-change-owner',
  imports: [SearchOwnersComponent, NewOwnerContractExampleComponent, OldOwnerContractExampleComponent, ButtonModule, DialogModule],
  templateUrl: './change-owner.component.html',
  styleUrl: './change-owner.component.scss'
})
export class ChangeOwnerComponent {
  @ViewChild('searchClient') searchClientComponent!: SearchOwnersComponent;
  @ViewChild('oldClientTerm') oldClientTerm!: ElementRef;
  @ViewChild('newClientTerm') newClientTerm!: ElementRef;

  oldClient!: DataClient;
  oldClientContract!: string;
  newClient!: DataClient;
  newClientContract!: string;
  signedDate!: Date;
  displayDialog: boolean = false;

  setOldClient(oldClient: DataClient) {
    this.oldClient = oldClient;
  }

  setNewClient(newClient: DataClient) {
    this.newClient = newClient;
  }

  setOldClientContract(oldClientContract: string) {
    this.oldClientContract = oldClientContract;
  }

  setNewClientContract(newClientContract: string) {
    this.newClientContract = newClientContract;
  }

  setSignedDate(signedDate: Date) {
    this.signedDate = signedDate;
  }

  clearFormFields() {
    setTimeout(() => {
      this.searchClientComponent.formDataClients.reset();
    }, 500);
  }

  printOldClientTerm() {
    this.printElement(this.oldClientTerm);
  }

  printNewClientTerm() {
    this.printElement(this.newClientTerm);
  }

  printElement(elementRef: ElementRef | undefined): void {
    if (!elementRef) {
      console.error('Elemento inválido para impressão.');
      return;
    }

    const elementHTML = elementRef.nativeElement.outerHTML;

    // Criar um iframe temporário
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';

    document.body.appendChild(iframe);

    const iframeDocument = iframe.contentWindow?.document;

    if (iframeDocument) {
      // Copiar os estilos do documento principal
      const styles = Array.from(document.styleSheets)
        .map((styleSheet) => {
          try {
            return Array.from(styleSheet.cssRules)
              .map((rule) => rule.cssText)
              .join('');
          } catch (error) {
            console.warn('Erro ao copiar regras de estilo:', error);
            return '';
          }
        })
        .join('');

      // Inserir o conteúdo no iframe
      iframeDocument.open();
      iframeDocument.write(`
      <html>
        <head>
          <style>${styles}</style>
        </head>
        <body>${elementHTML}</body>
      </html>
    `);
      iframeDocument.close();

      // Acionar a impressão
      iframe.contentWindow?.print();

      // Remover o iframe após a impressão
      if (iframe.contentWindow) {
        iframe.contentWindow.onafterprint = () => {
          document.body.removeChild(iframe);
        };
      }
    } else {
      console.error('Erro ao acessar o documento do iframe.');
    }
  }
}
