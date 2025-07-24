import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-view-contracts',
  imports: [CommonModule, ButtonModule],
  templateUrl: './view-contracts.component.html',
  styleUrl: './view-contracts.component.scss'
})
export class ViewContractsComponent implements OnInit, OnChanges {
  @Input() clientData: any[] = [];
  @Input({ required: true }) isPJorPF!: string | null;

  ngOnInit() {
    console.log('Client Data:', this.clientData);
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('Client Data')
  }

   get contracts(){
    return this.clientData?.[0]?.contracts || [];
  }



    pfPlans = [
    { name: "250 Megas - R$ 69,90", value: 9009 },
    { name: "500 Megas - R$ 79,90", value: 10697 },
    { name: "600 Megas - R$ 89,90", value: 10700 },
    { name: "750 Megas - R$ 99,90", value: 10703 },
    { name: "850 Megas - R$ 109,90", value: 10706 },
    { name: "1 Giga - R$ 199,90", value: 10710 },
  ];

  pjPlans = [
    { name: "100 Megas Empresarial - R$ 119,90", value: 481 },
    { name: "200 Megas Empresarial - R$ 129,90", value: 485 },
    { name: "300 Megas Empresarial - R$ 139,90", value: 486 },
    { name: "700 Megas Empresarial - R$ 149,90", value: 514 },
  ];


  getPlanLabel(codePlan: number | string): string {
    const code = Number(codePlan);
    const plan = [...this.pfPlans, ...this.pjPlans].find(
      (p) => p.value === code
    );
    return plan
      ? `${plan.value} - ${plan.name}`
      : `${codePlan} - Plano Desconhecido`;
  }


  //   removeContract(index: number): void {
  //   this.contracts.removeAt(index);
  // }

}
