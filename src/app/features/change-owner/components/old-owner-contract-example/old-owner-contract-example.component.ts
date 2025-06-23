import { Component, Input } from '@angular/core';
import { ContractClausesComponent } from "../contract-clauses/contract-clauses.component";
import { DataClient } from '../../../../interfaces/client-info.model';
import { CpfCnpjPipe } from '../../../../shared/pipes/cpf-cnpj.pipe';
import { PhonesPipe } from '../../../../shared/pipes/phones.pipe';
import { RgPipe } from '../../../../shared/pipes/rg.pipe';
import { DatePipe } from '@angular/common';
import { TextHoldersComponent } from "../text-holders/text-holders.component";

@Component({
  selector: 'app-old-owner-contract-example',
  imports: [ContractClausesComponent, CpfCnpjPipe, PhonesPipe, RgPipe, DatePipe, TextHoldersComponent],
  templateUrl: './old-owner-contract-example.component.html',
  styleUrl: './old-owner-contract-example.component.scss'
})
export class OldOwnerContractExampleComponent {
  @Input() oldClientInfo!: DataClient | null;
  @Input() oldClientContract!: string;
  @Input() newClientInfo!: DataClient | null;
  @Input() newClientContract!: string;
  @Input() date!: Date;
}
