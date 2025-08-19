import { finalize, Subject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { IftaLabelModule } from 'primeng/iftalabel';
import { ServiceOrderService } from '../../services/service-order.service';
import { ViewServiceOrderDto } from '../../../../interfaces/service-order.model';

@Component({
  selector: 'app-observation',
  imports: [CommonModule, TextareaModule, FormsModule, ButtonModule, IftaLabelModule ],
  templateUrl: './observation.component.html',
  styleUrl: './observation.component.scss'
})
export class ObservationComponent implements OnInit {
@Input({ required: true }) serviceOrder!: ViewServiceOrderDto;
@Output() eventObservation = new EventEmitter<void>();
 observationText!: string;
 isLoading = false;
  hasObservation: boolean = false;
  
 serviceOrderToObservation = inject(ServiceOrderService);

  ngOnInit() {
      this.observationText = this.serviceOrder.observation || '';
      this.loadServiceOrder();
  }

  submitObservation(){
    this.serviceOrderToObservation.patchServiceOrder(this.serviceOrder.id, { observation: this.observationText }).subscribe({
      next: () => {
          this.eventObservation.emit();
          
      },
      error: (e) => {
        console.log(e);
      }
    })
  }


   private loadServiceOrder() {
      this.isLoading = true;
      this.serviceOrderToObservation
        .findById(this.serviceOrder!.id)
        .pipe(finalize(() => (this.isLoading = false)))
        .subscribe({
          next: (response) => {
            this.serviceOrder = response;
          },
          error: (e) => {
            console.log(e);
          },
        });
    }


}
