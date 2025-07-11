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

@Component({
  selector: "app-helper-tech",
  imports: [
    CommonModule,
    SelectModule,
    ButtonModule,
    ReactiveFormsModule,
    DatePickerModule,
  ],
  templateUrl: "./helper-tech.component.html",
  styleUrl: "./helper-tech.component.scss",
  providers: [ServiceOrderService],
})
export class HelperTechComponent implements OnInit {
  @Input({ required: true }) technicians!: {
    label: string;
    value: string | null;
  }[];
  @Input({ required: true }) serviceOrder!: ViewServiceOrderDto | null;
  @Output() eventHelper = new EventEmitter<void>();
  serviceOrderHelper = inject(ServiceOrderService);

  isLoading = false;
  isSubmitting = false;

  fb = inject(FormBuilder);
  helperForm: FormGroup = this.fb.group({
    technicianId: ["", [Validators.required]],
    start: [""],
    end: [""],
  });

  helpers!: {
    technicianName: string;
    start: string;
    end: string;
  }[];

  constructor() {}

  ngOnInit() {
    this.loadServiceOrder();
    console.log(this.helpers)
  }

  private loadServiceOrder() {
    this.isLoading = true;
    this.serviceOrderHelper
      .findById(this.serviceOrder!.id)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response: ViewServiceOrderDto) => {
          this.serviceOrder = response;
          this.helpers = (response.technicalHelp ?? []).map(helper => ({
            technicianName: helper.technician.name,
            start: helper.startTime,
            end: helper.endTime
          }))
        },
        error: (e) => {
          console.log(e);
        },
      });
  }

  onSubmitHelper() {
    const endTime = new Date().toLocaleString("pt-BR").replace(",", "");
    this.technicianHelper(endTime);
  }

  technicianHelper(endTime: string) {
    if (this.serviceOrder && this.helperForm.valid) {
      const formValue = this.helperForm.value;

      const helperDto: CreateServiceOrderHelperDto = {
        technicianId: formValue.technicianId,
        start: formValue.start,
        end: formValue.end,
      };
      this.serviceOrderHelper
        .addHelper(this.serviceOrder.id, helperDto)
        .subscribe({
          next: () => {
            helperDto.end = endTime;

            const tech = this.technicians.find(t => t.value === formValue.technicianId);
             const technicianName = tech ? tech.label : 'Técnico';

            this.helpers.push({
              technicianName,
              start: formValue.start,
              end: formValue.end
            })


            this.helperForm.reset();
            this.eventHelper.emit();
          },
          error: (e) => {
            console.log(e);
          },
        });
    }
  }

}
