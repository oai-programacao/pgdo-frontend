import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DatePickerModule } from 'primeng/datepicker';
import { DropdownModule } from 'primeng/dropdown';
import { PanelModule } from 'primeng/panel';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { ViewBlockOffersDto, BlockPeriodOffersLabels, CreateBlockOffersDto, BlockPeriodOffers } from '../../../../interfaces/block-offers-request.model';
import { BlockOffersRequestService } from '../../services/block-offers-request.service';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-block-offers-request',
  imports: [ 
    CommonModule, 
    ReactiveFormsModule, 
    PanelModule, 
    ButtonModule, 
    DatePickerModule,
    SelectModule, 
    TableModule, 
    ToastModule, 
    TooltipModule, 
    TagModule,
    ConfirmDialogModule
  ],
  templateUrl: './block-offers-request.component.html',
  styleUrl: './block-offers-request.component.scss',
  providers: [MessageService, ConfirmationService]
})
export class BlockOffersRequestComponent implements OnInit{
  private fb = inject(FormBuilder);
  private blockOffersService = inject(BlockOffersRequestService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  existingBlocks: ViewBlockOffersDto[] = [];
  isLoading = true;

  createForm!: FormGroup;
  isSubmitting = false;

  periodOptions: any[];
  minDate = new Date(); // Impede que o usuário selecione datas passadas

  constructor() {
    this.periodOptions = Object.entries(BlockPeriodOffersLabels).map(([value, label]) => ({ label, value }));
  }

  ngOnInit(): void {
    this.initCreateForm();
    this.loadExistingBlocks();
  }

  initCreateForm(): void {
    this.createForm = this.fb.group({
      initialDate: [null, Validators.required],
      periodOffer: [null, Validators.required]
    });
  }

  loadExistingBlocks(): void {
    this.isLoading = true;
    this.blockOffersService.getAllBlockOffers().subscribe({
      next: (data) => {
        // Ordena para mostrar as configurações mais recentes primeiro
        this.existingBlocks = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        this.isLoading = false;
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar configurações existentes.' });
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    const formValue = this.createForm.value;

    const dto: CreateBlockOffersDto = {
      periodOffer: formValue.periodOffer,
      initialDate: formValue.initialDate,
    };

    this.blockOffersService.createBlockOffer(dto).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Configuração salva com sucesso!' });
        this.isSubmitting = false;
        this.createForm.reset();
        this.loadExistingBlocks(); // Atualiza a lista de configurações
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: err.error?.message || 'Falha ao salvar a configuração.' });
        this.isSubmitting = false;
      }
    });
  }

    // --- NOVO MÉTODO PARA DELEÇÃO ---
  confirmDelete(block: ViewBlockOffersDto): void {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja remover o bloqueio para a data <strong>${block.initialDate}</strong> e período <strong>"${this.getPeriodLabel(block.periodOffer)}"</strong>?`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, Excluir',
      rejectLabel: 'Não',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.isLoading = true; // Ativa o loading da tabela durante a exclusão
        this.blockOffersService.deleteBlockOffer(block.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Configuração de bloqueio removida.' });
            this.loadExistingBlocks(); // Recarrega a lista para refletir a exclusão
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: err.error?.message || 'Falha ao remover a configuração.' });
            this.isLoading = false; // Desativa o loading em caso de erro
          }
        });
      }
    });
  }

  getPeriodLabel(period: BlockPeriodOffers): string {
    return BlockPeriodOffersLabels[period] || period;
  }
}
