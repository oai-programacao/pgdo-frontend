import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { TextareaModule } from 'primeng/textarea';
import { TicketTopicsDescriptions, TicketTopicsLabels } from '../../../../interfaces/enums.model';
import { TooltipModule } from 'primeng/tooltip';
import { TicketService } from '../../services/ticket.service';

@Component({
  selector: 'app-create-ticket',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PanelModule,
    ButtonModule,
    ToastModule,
    SelectModule,
    TextareaModule,
    TooltipModule
  ],
  templateUrl: './create-ticket.component.html',
  styleUrl: './create-ticket.component.scss',
  providers: [MessageService]
})
export class CreateTicketComponent implements OnInit{
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private ticketService = inject(TicketService); // Assuming you have a ticket service for API calls

  createTicketForm!: FormGroup;
  topicOptions: any[] = [];

  ngOnInit(): void {
    this.createTicketForm = this.fb.group({
      description: ['', Validators.required],
      topic: ['', Validators.required]
    });
    this.topicOptions = this.getTopicsLabelAndTooltip();
  }

  getTopicsLabelAndTooltip(): {label: string, value: string, tooltip: string}[] {
    const topicsLabel = TicketTopicsLabels;
    const topicsTooltip = TicketTopicsDescriptions;

    return Object.keys(topicsLabel).map(key => ({
      label: topicsLabel[key as keyof typeof TicketTopicsLabels],
      value: key,
      tooltip: topicsTooltip[key as keyof typeof TicketTopicsDescriptions]
    }));
  }

  onSubmit(): void {
    if (this.createTicketForm.valid) {
      const ticketData = this.createTicketForm.value;
      this.ticketService.createTicket(ticketData).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Chamado criado com sucesso!' });
          this.createTicketForm.reset();
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao criar chamado.' });
          console.error(err);
        }
      });
    } else {
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Por favor, preencha todos os campos necessários.' });
    }
  }
}
