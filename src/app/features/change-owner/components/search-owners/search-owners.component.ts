import { Component, EventEmitter, output, Output } from '@angular/core';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ConsultClientsService } from '../../services/search-client.service';
import { DataClient } from '../../../../interfaces/client-info.model';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-search-owners',
  imports: [
    DatePickerModule,
    DividerModule,
    InputTextModule,
    InputNumberModule,
    ButtonModule,
    ReactiveFormsModule,
    FormsModule,
    ToastModule
  ],
  templateUrl: './search-owners.component.html',
  styleUrl: './search-owners.component.scss',
  providers: [MessageService],
})
export class SearchOwnersComponent {
  constructor(
    private consultClientService: ConsultClientsService,
    private formBuilder: FormBuilder,
    private messageService: MessageService
  ) {
    this.formDataClients = this.formBuilder.group({
      formerHolderCode: [null, Validators.required],
      currentHolderCode: [null, Validators.required],
      formerHolderContract: [null, Validators.required],
      currentHolderContract: [null, Validators.required],
      date: ['', Validators.required],
    });
  }

  oldClient = output<DataClient | null>();
  oldClientContract = output<string>();
  newClient = output<DataClient | null>();
  newClientContract = output<string>();
  signedDate = output<Date>();
  @Output() searchCompleted = new EventEmitter<void>();
  loading: boolean = false;
  visible: boolean = false;
  formDataClients!: FormGroup;

  getClientsData() {
    const oldClientCode = this.formDataClients.get('formerHolderCode')?.value;
    this.consultClientService.postConsultClient(oldClientCode).subscribe({
      next: (clientData: any) => {
        this.oldClient.emit(clientData.result[0]);
        this.oldClientContract.emit(
          this.formDataClients.get('formerHolderContract')?.value
        );
        this.getNewClientData();
      },
      error: (error: any) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro ao consultar dados do cliente antigo.',
          detail: 'Verifique se o código do cliente antigo está correto.',
        });
      },
    });
  }

  getNewClientData() {
    const currentHolderCode =
      this.formDataClients.get('currentHolderCode')?.value;
    this.consultClientService.postConsultClient(currentHolderCode).subscribe({
      next: (clientData: any) => {
        this.newClient.emit(clientData.result[0]);
        this.signedDate.emit(this.formDataClients.get('date')?.value);
        this.newClientContract.emit(
          this.formDataClients.get('currentHolderContract')?.value
        );
        this.searchCompleted.emit();
      },
      error: (error: any) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro ao consultar dados do cliente novo.',
          detail: 'Verifique se o código do cliente novo está correto.',
        });
      },
    });
  }

  clearFields() {
    this.formDataClients.reset();
  }
}
