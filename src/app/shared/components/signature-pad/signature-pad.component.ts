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
  const canvas = this.canvasEl.nativeElement as HTMLCanvasElement;

  // 👉 Garante que o canvas desenhe corretamente com dimensões visuais
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  this.signaturePad = new SignaturePad(canvas, {
    penColor: 'black',
    backgroundColor: 'white'
  });
}
clearPad() {
  this.signaturePad.clear();
}

savePad() {
  const base64Data = this.signaturePad.toDataURL();
  console.log('Assinatura base64:', base64Data);
  this.signatureImg = base64Data;
}

  startDrawing(event: Event) {
    // works in device not in browser
  }
  moved(event: Event) {
    // works in device not in browser
  }



}




//   ngAfterViewInit() {
//   this.signaturePad = new SignaturePad(this.canvasEl.nativeElement);
//   }
//   savePad() {
//     const base64Data = this.signaturePad.toDataURL();
//  }

//   clearPad() {
//     this.signaturePad.clear();
//   }