import { CommonModule } from "@angular/common";
import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from "@angular/core";
import { InputTextModule } from "primeng/inputtext";
import { SelectModule } from "primeng/select";
import { DatePickerModule } from "primeng/datepicker";
import { ViewServiceOrderDto } from "../../../../interfaces/service-order.model";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from "@angular/forms";
import {
  ServiceOrderStatus,
  ServiceOrderStatusLabels,
  City,
  CitiesLabels,
  TypeOfOs,
  TypeOfOsLabels,
  Period,
  PeriodLabels,
} from "../../../../interfaces/enums.model";
import { ButtonModule } from "primeng/button";
import { ServiceOrderService } from "../../services/service-order.service";
import { MessageService } from "primeng/api";
import { PhonesPipe } from "../../../../shared/pipes/phones.pipe";
import { ToastModule } from "primeng/toast";
import { finalize } from "rxjs";

@Component({
  selector: "app-edit",
  imports: [
    CommonModule,
    InputTextModule,
    ReactiveFormsModule,
    SelectModule,
    DatePickerModule,
    ButtonModule,
    PhonesPipe,
    ToastModule,
  ],
  templateUrl: "./edit.component.html",
  styleUrl: "./edit.component.scss",
  providers: [ServiceOrderService, MessageService],
})
export class EditComponent implements OnInit {
  @Input({ required: true }) serviceOrder!: ViewServiceOrderDto;
  @Output() eventEdit = new EventEmitter<void>();

  fb = inject(FormBuilder);
  orderService = inject(ServiceOrderService);
  messageService = inject(MessageService);

  form!: FormGroup;
  isLoading = false;
  isSubmitting = false;

  cablingOptions: any[] = [
    { label: "Sim", value: true },
    { label: "Não", value: false },
  ];
  isActiveToReportOptions: any[] = [
    { label: "Sim", value: true },
    { label: "Não", value: false },
  ];
  technologyOptions: any[] = [
    { label: "Fibra Óptica", value: "FIBER_OPTIC" },
    { label: "Rádio", value: "RADIO" },
  ];

  ngOnInit() {
    this.form = new FormGroup({
      technology: new FormControl(this.serviceOrder?.technology ?? null),
      cabling: new FormControl(this.serviceOrder?.cabling ?? null),
      isActiveToReport: new FormControl(
        this.serviceOrder?.isActiveToReport ?? null
      ),
    });

   
  }

  editServiceOrder() {
    const formValue = {
      technology: this.form.value.technology,
      cabling: this.form.value.cabling,
      isActiveToReport: this.form.value.isActiveToReport,
    };
    this.orderService
      .patchServiceOrder(this.serviceOrder.id, formValue)
      .subscribe({
        next: () => {
          this.eventEdit.emit();
        },
        error: (e) => {
          console.log(e);
        },
      });
  }



  private mapLabelsToOptions = (labels: Record<string, string>): any[] =>
  Object.entries(labels).map(([value, label]) => ({ label, value }));
  getStatusLabel = (status: string) =>
  ServiceOrderStatusLabels[status as ServiceOrderStatus] || status;
  getCitiesLabel = (city: City) => CitiesLabels[city] || city;
  getTypeOfOsLabel = (type: TypeOfOs) => TypeOfOsLabels[type] || type;
  getPeriodLabel = (period: Period) => PeriodLabels[period] || period;
}
