import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RegisterClientService } from '../../services/register-client.service';
import { ViewRegisterClientResponseDto } from '../../../../interfaces/register-client.model';
import { TableLazyLoadEvent } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { CustomPageResponse } from '../../../../interfaces/service-order.model';
import { CpfCnpjPipe } from "../../../../shared/pipes/cpf-cnpj.pipe";

@Component({
  selector: 'app-list-client-register',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    CpfCnpjPipe
],
  templateUrl: './list-client-register.component.html',
  styleUrl: './list-client-register.component.scss',
  providers: [MessageService]
})
export class ListClientRegisterComponent {
  private readonly registerClientService = inject(RegisterClientService);
  private readonly messageService = inject(MessageService);
  private readonly fb = inject(FormBuilder);

  clients: ViewRegisterClientResponseDto[] = [];
  isLoadingClients = false;
  totalRecords = 0;
  rows = 20;
  first = 0;

  constructor() {
    this.loadClients();
  }

  private loadClients(event?: TableLazyLoadEvent) {
    this.isLoadingClients = true;

    if (event) {
      this.first = event.first || 0;
      this.rows = event.rows || 20;
    }

    this.registerClientService.getAllRegisteredClients(this.first, this.rows).subscribe({
      next: (clients: CustomPageResponse<ViewRegisterClientResponseDto>) => {
        this.clients = clients.content;
        this.isLoadingClients = false;
      },
      error: () => {
        this.isLoadingClients = false;
      }
    });
  }



}
