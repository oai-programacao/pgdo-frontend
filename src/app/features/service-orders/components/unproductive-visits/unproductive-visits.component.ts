import { CommonModule } from "@angular/common";
import { AfterViewInit, Component, inject, Input, OnInit } from "@angular/core";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { InputTextModule } from "primeng/inputtext";
import { SelectModule } from "primeng/select";
import { ServiceOrderService } from "../../services/service-order.service";
import { ButtonModule } from "primeng/button";
import { ViewServiceOrderDto } from "../../../../interfaces/service-order.model";

@Component({
  selector: "app-unproductive-visits",
  imports: [
    CommonModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    ReactiveFormsModule,
  ],
  templateUrl: "./unproductive-visits.component.html",
  styleUrl: "./unproductive-visits.component.scss",
})
export class UnproductiveVisitsComponent implements OnInit {
  @Input({ required: true }) technicians!: {
    label: string;
    value: string | null;
  }[];
  @Input({ required: true }) serviceOrder!: ViewServiceOrderDto;

  form!: FormGroup;

  private readonly serviceOrderService = inject(ServiceOrderService);

constructor() {
  this.form = new FormGroup({
    technicianId: new FormControl(null, Validators.required),
    
    observation: new FormControl("", Validators.required),
  });
}

  ngOnInit() {
      this.serviceOrderService.findById(this.serviceOrder.id).subscribe({
        next: (response) => {
          this.serviceOrder = response;
        },
        error: (e) => {
          console.log(e);
        }
      },
    )
  }

  submit() {
    if (this.form.valid) {
    const unproductiveVisit = {
      technicianId: this.form.value.technicianId,
      date: new Date().toLocaleString('pt-BR').replace(',', ''), 
      observation: this.form.value.observation,
    };

    this.serviceOrderService
      .addUnproductiveVisit(this.serviceOrder.id, unproductiveVisit)
      .subscribe({
        next: () => {

          this.form.reset()
        },
        error: (e) => {
          console.log("Erro:", e);
        },
      });
  }
  }
}
