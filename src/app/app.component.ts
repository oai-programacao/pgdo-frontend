import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PrimeNGConfigType } from 'primeng/config';
import { Subscription } from 'rxjs';
import { AuthService } from './core/auth/auth.service';
import { SseService } from './core/sse/sse.service';
import { MessageService } from 'primeng/api';

import { ToastModule } from 'primeng/toast';

// import { SseService } from './core/sse/sse.service';

@Component({
  selector: "app-root",
  imports: [RouterOutlet, CommonModule, ToastModule],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
  providers: [MessageService]
})
export class AppComponent implements OnInit {
  constructor(
    private sseService: SseService,
    private messageService: MessageService,
    private authService: AuthService
  ) {}


//   ngOnInit(): void {
//   this.messageService.add({
//     severity: 'success',
//     summary: 'Teste',
//     detail: 'Toast de teste!',
//     life: 4000
//   });
//   this.playNotificationSound();
// }

ngOnInit(): void {
  this.sseService.notificationEvents$.subscribe({
    next: (notification) => {
      // Só notifica se o status for 'ACCEPTED' e o responsável for o usuário logado
      if (
        notification.status === 'ACCEPTED' &&
        notification.responsible === this.getCurrentUserName()
      ) {
        this.messageService.add({
          severity: 'success',
          summary: 'Oferta Aceita',
          detail: 'Sua solicitação de oferta foi aceita!',
          life: 4000
        });
        this.playNotificationSound();
      }
    }
  });
}

getCurrentUserName(): string | null {
  return this.authService.currentUserSubject.value?.name ?? null;
}

  isMyOffer(notification: any): boolean {
    // Implemente a lógica para saber se a oferta é do usuário logado
    return notification.userId === this.getCurrentUserId();
  }

getCurrentUserId(): string | null {
  // Se o usuário estiver logado, retorna o employeeId
  return this.authService.currentUserSubject.value?.employeeId ?? null;
}

playNotificationSound() {
  const audio = new Audio('/livechat-129007.mp3');
  audio.play();
}
}
