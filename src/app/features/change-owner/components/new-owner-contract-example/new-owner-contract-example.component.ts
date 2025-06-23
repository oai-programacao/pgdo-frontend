import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DividerModule } from 'primeng/divider';
import { CpfCnpjPipe } from '../../../../shared/pipes/cpf-cnpj.pipe';
import { PhonesPipe } from '../../../../shared/pipes/phones.pipe';
import { RgPipe } from '../../../../shared/pipes/rg.pipe';
import { TextHoldersComponent } from '../text-holders/text-holders.component';
import { DataClient } from '../../../../interfaces/client-info.model';
import { DatePipe } from '@angular/common';
import { NewHolderContractClausesComponent } from "../new-holder-contract-clauses/new-holder-contract-clauses.component";

@Component({
  selector: 'app-new-owner-contract-example',
  imports: [TextHoldersComponent, PhonesPipe, RgPipe, CpfCnpjPipe, DividerModule, DatePipe, NewHolderContractClausesComponent],
  templateUrl: './new-owner-contract-example.component.html',
  styleUrl: './new-owner-contract-example.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewOwnerContractExampleComponent {

  @Input() newClientInfo!: DataClient | null;
  @Input() newClientContract!: string;
  @Input() currentClientInfo!: DataClient | null;
  @Input() currentClientContract!: string;
  @Input() date!: Date;
}
