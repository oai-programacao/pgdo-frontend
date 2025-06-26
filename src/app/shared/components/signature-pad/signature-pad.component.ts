import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
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
export class SignaturePadComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvasEl!: ElementRef<HTMLCanvasElement>;
  signaturePad!: SignaturePad;
  signatureImg!: string;
  private resizeObserver!: ResizeObserver;

  ngAfterViewInit() {
    const canvas = this.canvasEl.nativeElement;

    this.signaturePad = new SignaturePad(canvas, {
      backgroundColor: 'white',
      minWidth: 0.5,
      maxWidth: 2,
      penColor: 'black',
    });

    this.resizeCanvas(); // inicial

    // Responsivo: atualiza o canvas quando o elemento for redimensionado
    this.resizeObserver = new ResizeObserver(() => this.resizeCanvas());
    this.resizeObserver.observe(canvas);
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  private resizeCanvas() {
    const canvas = this.canvasEl.nativeElement;
    const ratio = Math.max(window.devicePixelRatio || 1, 1);

    // Salva a assinatura temporariamente antes de redimensionar
    const data = this.signaturePad.toData();

    // Ajusta o tamanho físico
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;

    // Ajusta o tamanho visual
    canvas.getContext('2d')?.scale(ratio, ratio);

    this.signaturePad.clear(); // limpa primeiro
    this.signaturePad.fromData(data); // restaura a assinatura existente
  }

  clearPad() {
    this.signaturePad.clear();
  }

  savePad() {
    if (this.signaturePad.isEmpty()) {
      console.warn('Assinatura está vazia');
      return;
    }
    this.signatureImg = this.signaturePad.toDataURL();
    console.log('Assinatura base64:', this.signatureImg);
  }
}