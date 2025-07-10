import { CommonModule } from "@angular/common";
import {
  Component,
  inject,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from "@angular/core";
import { InputTextModule } from "primeng/inputtext";
import { SelectModule } from "primeng/select";
import { DatePickerModule } from "primeng/datepicker";
import { ViewServiceOrderDto } from "../../../../interfaces/service-order.model";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
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

@Component({
  selector: "app-edit",
  imports: [
    CommonModule,
    InputTextModule,
    ReactiveFormsModule,
    SelectModule,
    DatePickerModule,
  ],
  templateUrl: "./edit.component.html",
  styleUrl: "./edit.component.scss",
})
export class EditComponent implements OnInit, OnChanges {
  @Input({ required: true }) serviceOrder!: ViewServiceOrderDto;
  form!: FormGroup;
  fb = inject(FormBuilder);
  cablingOptions: any[] = [
    {
      label: "Sim",
      value: true,
    },
    {
      label: "Não",
      value: false,
    },
  ];
  isActiveToReportOptions: any[] = [
    {
      label: "Sim",
      value: true,
    },
    {
      label: "Não",
      value: false,
    },
  ];
  technologyOptions: any[] = [
    { label: "Fibra Óptica", value: "FIBER_OPTIC" },
    { label: "Rádio", value: "RADIO" },
  ];

  constructor() {}

  initForm() {}

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {}

  private mapLabelsToOptions = (labels: Record<string, string>): any[] =>
    Object.entries(labels).map(([value, label]) => ({ label, value }));
  getStatusLabel = (status: string) =>
    ServiceOrderStatusLabels[status as ServiceOrderStatus] || status;
  getCitiesLabel = (city: City) => CitiesLabels[city] || city;
  getTypeOfOsLabel = (type: TypeOfOs) => TypeOfOsLabels[type] || type;
  getPeriodLabel = (period: Period) => PeriodLabels[period] || period;
}
