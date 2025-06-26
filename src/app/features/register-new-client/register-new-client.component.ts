import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";

// PRIME
import { InputTextModule } from "primeng/inputtext";
import { StepperModule } from "primeng/stepper";
import { ButtonModule } from "primeng/button";
import { IftaLabelModule } from "primeng/iftalabel";
import { SelectModule } from 'primeng/select';
import {  FormsModule} from "@angular/forms";
import { DatePickerModule } from 'primeng/datepicker';
import { TextareaModule } from 'primeng/textarea';
import { FloatLabel } from 'primeng/floatlabel';
import { SignaturePadComponent } from "../../shared/components/signature-pad/signature-pad.component";
@Component({
  selector: "app-register-new-client",
  imports: [
    CommonModule,
    InputTextModule,
    StepperModule,
    ButtonModule,
    FormsModule,
    IftaLabelModule,
    SelectModule,
    DatePickerModule,
    TextareaModule,
    FloatLabel,
    SignaturePadComponent
],
  templateUrl: "./register-new-client.component.html",
  styleUrl: "./register-new-client.component.scss",
  providers: [
    ]
})
export class RegisterNewClientComponent implements OnInit {
  selectedTypePerson!: any;
 typePerson: any = [
      {name: "Pessoa Física", value: "PF"},
      {name: "Pessoa Jurídica", value: "PJ"}
    
    ]
  ngOnInit(){
   
  }

  doneSigment() {
    console.log("Finalizando o cadastro do cliente");
  }
}
