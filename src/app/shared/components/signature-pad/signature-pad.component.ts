import { Component, ElementRef, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import SignaturePad from 'signature_pad';

@Component({
  selector: 'app-signature-pad',
  imports: [
    ButtonModule
  ],
  templateUrl: './signature-pad.component.html',
  styleUrl: './signature-pad.component.scss'
})
export class SignaturePadComponent {
  signatureNeeded!: boolean;
  signaturePad!: SignaturePad;
  @ViewChild('canvas') canvasEl!: ElementRef;
  signatureImg!: string;

  ngAfterViewInit() {
  this.signaturePad = new SignaturePad(this.canvasEl.nativeElement);
  }

  startDrawing(event: Event) {
    // works in device not in browser
  }
  moved(event: Event) {
    // works in device not in browser
  }
  savePad() {
    const base64Data = this.signaturePad.toDataURL();
 }

  clearPad() {
    this.signaturePad.clear();
  }
}
