import { CommonModule } from "@angular/common";
import { Component, EventEmitter, inject, Input, Output } from "@angular/core";
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
import { DatePickerModule } from 'primeng/datepicker';

@Component({
  selector: "app-helper-tech",
  imports: [CommonModule, SelectModule, ButtonModule, ReactiveFormsModule, DatePickerModule],
  templateUrl: "./helper-tech.component.html",
  styleUrl: "./helper-tech.component.scss",
  providers: [ServiceOrderService],
})
export class HelperTechComponent {
  @Input({ required: true }) technicians!: {
    label: string;
    value: string | null;
  }[];
  @Input({ required: true }) serviceOrder!: ViewServiceOrderDto | null;
  serviceOrderHelper = inject(ServiceOrderService);
  fb = inject(FormBuilder);

  helperForm: FormGroup = this.fb.group({
    technicianId: ["", [Validators.required]],
    start: [""],
    end: ['']
  });

  constructor() {}


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
            this.helperForm.reset();
          },
          error: (e) => {
            console.log(e);
          },
        });
    }
  }
}
