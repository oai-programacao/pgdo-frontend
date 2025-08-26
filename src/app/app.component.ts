

import { webSocket } from 'rxjs/webSocket';
import {
  Component,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
} from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { CommonModule } from "@angular/common";
import { Subscription } from "rxjs";
import { MessageService } from "primeng/api";
import { Toast } from "primeng/toast";
import { AuthService } from "./core/auth/auth.service";
import { AdminOffersService } from "./features/offers/services/admin-offers.service";
import { AudioUnlockService } from "./core/audio/audio-unlock.service";
import { WsService } from './core/sse/sse.service';

@Component({
  selector: "app-root",
  imports: [RouterOutlet, CommonModule, Toast],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
  providers: [MessageService],
})
export class AppComponent implements OnInit {
  constructor(
    private webSocket: WsService,
    private messageService: MessageService,
    private authService: AuthService,
    private audioUnlockService: AudioUnlockService,
    private offersAdmin: AdminOffersService
  ) {}

  @HostListener("window:click")
  onFirstClick() {
    this.audioUnlockService.unlockAudio();
  }

  ngOnInit(): void {
    this.webSocket.notificationEvents$.subscribe((notification: any) => {
      console.log(
        "DIAGNÓSTICO 1: Evento SSE recebido:",
        JSON.stringify(notification, null, 2)
      );
      const status = notification.status;
      if (status === "ACCEPTED") {
        this.messageService.add({
          severity: "success",
          summary: "Oferta Aceita!",
          detail: "Uma solicitação de oferta foi aceita por um administrador.",
          life: 7000,
        });
        if (this.audioUnlockService.canPlayAudio()) {
          const audio = new Audio("/livechat-129007.mp3");
          audio
            .play()
            .catch((e) => console.error("Falha ao tocar o áudio.", e));
        }
      } else {
        console.log(
          "DIAGNÓSTICO 4: Evento não é de aceitação. Nenhuma notificação será exibida."
        );
      }
    });
  }

  getCurrentUserId(): string | null {
    // Ajuste aqui se o identificador for o e-mail:
    // return this.authService.currentUserSubject.value?.email ?? null;
    return this.authService.currentUserSubject.value?.employeeId ?? null;
  }
}
