import { CommonModule } from "@angular/common";
import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ServiceOrderService } from "../../services/service-order.service";
import { SelectModule } from "primeng/select";
import { ButtonModule } from "primeng/button";
import {
  ViewServiceOrderDto,
  CreateServiceOrderHelperDto,
} from "../../../../interfaces/service-order.model";
import { DatePickerModule } from "primeng/datepicker";
import { finalize } from "rxjs";
import { TooltipModule } from "primeng/tooltip";
import { MessageService } from "primeng/api"; // Adicionado
import { ToastModule } from 'primeng/toast';

@Component({
  selector: "app-helper-tech",
  imports: [
    CommonModule,
    SelectModule,
    ButtonModule,
    ReactiveFormsModule,
    DatePickerModule,
    TooltipModule,
    ToastModule
  ],
  templateUrl: "./helper-tech.component.html",
  styleUrl: "./helper-tech.component.scss",
  providers: [ServiceOrderService, MessageService], // Adicionado MessageService
})
export class HelperTechComponent implements OnInit {
  @Input({ required: true }) technicians!: {
    label: string;
    value: string | null;
  }[];
  @Input({ required: true }) serviceOrder!: ViewServiceOrderDto | null;
  @Output() eventHelper = new EventEmitter<void>();
  serviceOrderHelper = inject(ServiceOrderService);
  messageService = inject(MessageService); // Adicionado

  editingHelperId: string | null = null;
  isLoading = false;
  isSubmitting = false;

  fb = inject(FormBuilder);
  helperForm: FormGroup = this.fb.group({
    technicianId: ["", [Validators.required]],
    start: [""],
    end: [""],
  });

  helpers!: {
    id: string;
    technicianId?: string;
    technicianName: string;
    start: string;
    end: string;
  }[];

  constructor() {}

  ngOnInit() {
    this.loadServiceOrder();
  }

  private loadServiceOrder() {
    if (!this.serviceOrder) return;
    this.isLoading = true;
    this.serviceOrderHelper
      .findById(this.serviceOrder.id)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response: ViewServiceOrderDto) => {
          this.serviceOrder = response;
          this.helpers = (response.technicalHelp ?? []).map((h) => ({
            id: h.id,
            technicianId: h.technician?.id ?? null,
            technicianName: h.technician?.name ?? "Técnico",
            start: h.startTime,
            end: h.endTime,
          }));
        },
        error: (e) => {
          console.log(e);
        },
      });
  }

  onSubmitHelper() {
    if (this.editingHelperId) {
      this.updateTechnicianHelper(this.editingHelperId);
      this.editingHelperId = null;
    } else {
      this.addTechnicianHelper();
    }
    this.helperForm.reset();
  }

  private addTechnicianHelper() {
    if (!this.serviceOrder || !this.helperForm.valid) return;
    const formValue = this.helperForm.value;
    const techId = this.getTechnicianId(formValue.technicianId);
    if (!techId) {
      console.error("technicianId inválido:", formValue.technicianId);
      return;
    }

    const helperDto: CreateServiceOrderHelperDto = {
      technicianId: techId,
      start: this.formatDateTime(formValue.start),
      end: this.formatDateTime(formValue.end),
    };

    this.serviceOrderHelper.addHelper(this.serviceOrder.id, helperDto).subscribe({
      next: () => {
        this.loadServiceOrder();
        this.eventHelper.emit();
        this.messageService.add({
          severity: "success",
          summary: "Sucesso",
          detail: "Técnico adicionado com sucesso!",
        });
      },
      error: (e) => {
        console.log(e);
        this.messageService.add({
          severity: "error",
          summary: "Erro",
          detail: "Erro ao adicionar técnico.",
        });
      },
    });
  }

  updateTechnicianHelper(helperId: string) {
    if (!this.helperForm.valid) return;
    const formValue = this.helperForm.value;
    const techId = this.getTechnicianId(formValue.technicianId);
    if (!techId) {
      console.error("technicianId inválido:", formValue.technicianId);
      return;
    }

    const helperDto: CreateServiceOrderHelperDto = {
      technicianId: techId,
      start: this.formatDateTime(formValue.start),
      end: this.formatDateTime(formValue.end),
    };

    this.serviceOrderHelper.patchTechnicianHelper(helperId, helperDto).subscribe({
      next: () => {
        this.loadServiceOrder();
        this.messageService.add({
          severity: "success",
          summary: "Sucesso",
          detail: "Ajuda Técnica editada com sucesso!",
        });
      },
      error: (e) => {
        console.log(e);
        this.messageService.add({
          severity: "error",
          summary: "Erro",
          detail: "Erro ao editar técnico.",
        });
      },
    });
  }

  editHelper(helper: { id: string; technicianId?: string; technicianName: string; start: string; end: string; }) {
    const startDate = this.parseDateFromString(helper.start);
    const endDate = this.parseDateFromString(helper.end);

    this.helperForm.patchValue({
      technicianId: helper.technicianId ?? "",
      start: startDate,
      end: endDate,
    });
    this.editingHelperId = helper.id;
  }

  deleteTechnicianHelper(helperId: string) {
    this.serviceOrderHelper.deleteTechnicianHelper(helperId).subscribe({
      next: (response) => {
        this.loadServiceOrder();
        this.messageService.add({
          severity: "warn",
          summary: "Removido",
          detail: "Ajuda Técnica removida com sucesso!",
        });
      },
      error: (e) => {
        console.log(e);
        this.messageService.add({
          severity: "error",
          summary: "Erro",
          detail: "Erro ao excluir técnico.",
        });
      },
    });
  }

  private getTechnicianId(value: any): string | null {
    if (!value && value !== 0) return null;
    if (typeof value === "string") return value;
    if (typeof value === "number") return String(value);
    if (value?.id) return String(value.id);
    if (value?.value) return String(value.value);
    return null;
  }

  private formatDateTime(date: any): string {
    if (!date) return "";
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return "";
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  private parseAndFormatDateString(dateStr: string): string {
    // aceita formatos como:
    // "14/08/2025 11:30:00", "14/08/2025 11:30", "14/08/25 11:30", "14/08/2025"
    const parts = dateStr.trim().split(" ");
    const datePart = parts[0];
    const timePart = parts[1] ?? "00:00";

    const dateMatch = /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/.exec(datePart);
    if (!dateMatch) return dateStr;

    let day = dateMatch[1].padStart(2, "0");
    let month = dateMatch[2].padStart(2, "0");
    let year = dateMatch[3];
    if (year.length === 2) year = "20" + year;

    const timeMatch = /^(\d{1,2}):(\d{1,2})(?::\d{1,2})?$/.exec(timePart);
    let hour = "00";
    let minute = "00";
    if (timeMatch) {
      hour = timeMatch[1].padStart(2, "0");
      minute = timeMatch[2].padStart(2, "0");
    }

    return `${day}/${month}/${year} ${hour}:${minute}`;
  }

   private parseDateFromString(dateStr?: string | null): Date | null {
    if (!dateStr) return null;
    const parts = dateStr.trim().split(" ");
    const datePart = parts[0];
    const timePart = parts[1] ?? "00:00";

    const dateMatch = /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/.exec(datePart);
    if (!dateMatch) return null;

    let day = parseInt(dateMatch[1], 10);
    let month = parseInt(dateMatch[2], 10) - 1;
    let year = parseInt(dateMatch[3], 10);
    if (dateMatch[3].length === 2) year += 2000;

    const timeMatch = /^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/.exec(timePart);
    let hour = 0, minute = 0, second = 0;
    if (timeMatch) {
      hour = parseInt(timeMatch[1], 10);
      minute = parseInt(timeMatch[2], 10);
      second = timeMatch[3] ? parseInt(timeMatch[3], 10) : 0;
    }

    const d = new Date(year, month, day, hour, minute, second);
    return isNaN(d.getTime()) ? null : d;
  }
}