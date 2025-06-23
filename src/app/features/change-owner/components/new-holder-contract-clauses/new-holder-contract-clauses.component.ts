import { Component, Input } from '@angular/core';
import { DividerModule } from 'primeng/divider';
import { CpfCnpjPipe } from '../../../../shared/pipes/cpf-cnpj.pipe';
import { DataClient } from '../../../../interfaces/client-info.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-new-holder-contract-clauses',
  imports: [DividerModule, CpfCnpjPipe, DatePipe],
  templateUrl: './new-holder-contract-clauses.component.html',
  styleUrl: './new-holder-contract-clauses.component.scss'
})
export class NewHolderContractClausesComponent {
  @Input() newClientContract!: string;
  @Input() newClient!: DataClient | null;
  @Input() newClientSignature!: string;
  @Input() signedDate!: Date;
}
