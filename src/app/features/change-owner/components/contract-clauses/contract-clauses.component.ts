import { Component, Input } from '@angular/core';
import { DataClient } from '../../../../interfaces/client-info.model';
import { DividerModule } from 'primeng/divider';
import { DatePipe } from '@angular/common';
import { CpfCnpjPipe } from '../../../../shared/pipes/cpf-cnpj.pipe';

@Component({
  selector: 'app-contract-clauses',
  imports: [DividerModule, DatePipe, CpfCnpjPipe],
  templateUrl: './contract-clauses.component.html',
  styleUrl: './contract-clauses.component.scss'
})
export class ContractClausesComponent {
  @Input() oldClientContract!: string;
  @Input() oldClient!: DataClient | null;
  @Input() newClientContract!: string;
  @Input() newClient!: DataClient | null;
  @Input() signedDate!: Date;
}
