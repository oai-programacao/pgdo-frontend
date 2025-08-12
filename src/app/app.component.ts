import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { SseService } from './core/sse/sse.service';
import { MessageService } from 'primeng/api';
import { Toast } from "primeng/toast";

@Component({
  selector: "app-root",
  imports: [RouterOutlet, CommonModule, Toast],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
  providers: [MessageService]
})
export class AppComponent implements OnInit, OnDestroy {
  private notificationSub?: Subscription;
  private sseService = inject(SseService);
  private messageService = inject(MessageService);

  ngOnInit() {
    this.notificationSub = this.sseService.notificationEvents$.subscribe(() => {
      this.messageService.add({
        severity: "info",
        summary: "Nova oferta",
        detail: "Uma nova oferta foi registrada.",
        life: 3000,
      });
    });
  }

  ngOnDestroy() {
    this.notificationSub?.unsubscribe();
  }
}