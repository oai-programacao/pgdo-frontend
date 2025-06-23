import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-text-holders',
  imports: [],
  templateUrl: './text-holders.component.html',
  styleUrl: './text-holders.component.scss'
})
export class TextHoldersComponent {
  @Input() data: any;

  email: string = 'oai@oai.com.br';
}
