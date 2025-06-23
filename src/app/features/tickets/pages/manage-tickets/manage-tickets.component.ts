import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { TicketService } from '../../services/ticket.service';
import { MessageService } from 'primeng/api';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CommonModule, DatePipe } from '@angular/common';
import { Ticket, UpdateTicketDto } from '../../../../interfaces/ticket.model';
import { CustomPageResponse } from '../../../../interfaces/service-order.model';
import { TicketStatus, TicketStatusLabels, TicketTopics, TicketTopicsLabels } from '../../../../interfaces/enums.model';
import { TagModule } from 'primeng/tag';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { TextareaModule } from 'primeng/textarea';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-manage-tickets',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, TableModule, ButtonModule, TagModule, DropdownModule, 
    DialogModule, TextareaModule, ToastModule, ToolbarModule, TooltipModule
  ],
  templateUrl: './manage-tickets.component.html',
  styleUrl: './manage-tickets.component.scss',
  providers: [MessageService]
})
export class ManageTicketsComponent implements OnInit, OnDestroy{
  private ticketService = inject(TicketService);
  private messageService = inject(MessageService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  tickets: Ticket[] = [];
  totalRecords = 0;
  loading = false;


  // Filtros
  filterForm!: FormGroup;
  statusOptions: any[];
  topicOptions: any[];

  // Paginação
  rows = 10;
  first = 0;

  // Modal de Atualização
  displayUpdateModal = false;
  updateTicketForm!: FormGroup;
  selectedTicket: Ticket | null = null;
  isUpdating = false;

  constructor() {
    this.statusOptions = this.enumToDropdownOptions(TicketStatusLabels);
    this.topicOptions = this.enumToDropdownOptions(TicketTopicsLabels);
  }

  ngOnInit(): void {
    this.initFilterForm();
    this.initUpdateForm();
    this.syncFiltersWithUrl();
    this.listenToFilterChanges();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


  private initFilterForm(): void {
    this.filterForm = this.fb.group({
      status: [null],
      topic: [null]
    });
  }

  private initUpdateForm(): void {
    this.updateTicketForm = this.fb.group({
      status: [null, Validators.required],
      resolution: ['', Validators.required]
    });
  }

   private syncFiltersWithUrl(): void {
    this.route.queryParamMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const page = params.get('page') ? parseInt(params.get('page')!, 10) : 0;
      this.rows = params.get('size') ? parseInt(params.get('size')!, 10) : 10;
      this.first = page * this.rows;

      const filters = {
        status: params.get('status') as TicketStatus || null,
        topic: params.get('topic') as TicketTopics || null
      };
      this.filterForm.patchValue(filters, { emitEvent: false });
      this.loadTickets();
    });
  }

  private listenToFilterChanges(): void {
    this.filterForm.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.first = 0; // Reseta para a primeira página ao filtrar
      this.updateUrl();
    });
  }

  loadTickets(event?: TableLazyLoadEvent): void {
    this.loading = true;
    if (event) {
      this.first = event.first ?? 0;
      this.rows = event.rows ?? 10;
    }
    const page = Math.floor(this.first / this.rows);
    const filters = this.filterForm.value;

    this.ticketService.getAllTickets(page, this.rows, filters.status, filters.topic).subscribe({
      next: (dataPage: CustomPageResponse<Ticket>) => {
        this.tickets = dataPage.content;
        this.totalRecords = dataPage.page.totalElements;
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar chamados.' });
        this.loading = false;
        console.error('Erro ao carregar chamados:', error);
      }
    });
  }

  // MÉTODO AJUSTADO PARA CORRIGIR O PROBLEMA
  updateUrl(): void {
    const page = Math.floor(this.first / this.rows);
    const size = this.rows;
    const formValues = this.filterForm.value;
    
    const queryParams: any = { page, size };

    // Adiciona os filtros ao objeto de query params APENAS se eles tiverem um valor
    for (const key in formValues) {
      if (formValues[key]) { // Checa por valores 'truthy' (não null, não undefined, não string vazia)
        queryParams[key] = formValues[key];
      }
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams, // Passa o objeto de params construído
      // NENHUM queryParamsHandling: 'merge' aqui. O padrão é sobrescrever, que é o que queremos.
    });
  }

  clearFilters(): void {
    // Apenas reseta o formulário.
    // O valueChanges vai disparar e chamar updateUrl, que agora funciona corretamente.
    this.filterForm.reset({
      status: null,
      topic: null
    });
  }

  openUpdateModal(ticket: Ticket): void {
    this.selectedTicket = ticket;
    this.updateTicketForm.patchValue({
      status: ticket.status,
      resolution: ticket.resolution || ''
    });
    this.displayUpdateModal = true;
  }

  onUpdateSubmit(): void {
    if (this.updateTicketForm.invalid || !this.selectedTicket) {
      this.updateTicketForm.markAllAsTouched();
      return;
    }

    this.isUpdating = true;
    const dto: UpdateTicketDto = this.updateTicketForm.value;
    
    this.ticketService.updateTicket(this.selectedTicket.id, dto).subscribe({
      next: (updatedTicket) => {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: `Chamado #${updatedTicket.id.substring(0,8)} atualizado.` });
        this.displayUpdateModal = false;
        this.isUpdating = false;
        this.loadTickets(); // Recarrega a lista
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao atualizar o chamado.' });
        this.isUpdating = false;
        console.error(err);
      }
    });
  }

  // Helpers
  enumToDropdownOptions(labels: Record<string, string>): any[] {
    return Object.keys(labels).map(key => ({ label: labels[key], value: key }));
  }

  getStatusLabel(status: TicketStatus): string {
    return TicketStatusLabels[status] || 'Unknown Status';
  }

  getStatusTagSeverity(status: TicketStatus): any {
    switch (status) {
      case TicketStatus.OPEN:
        return 'info';
      case TicketStatus.EXECUTED:
        return 'success';
      case TicketStatus.CANCELED:
        return 'danger';
      default:
        return 'secondary';
    }
  }

  getTopicLabel(topic: TicketTopics): string {
    return TicketTopicsLabels[topic] || 'Unknown Topic';
  }

}
