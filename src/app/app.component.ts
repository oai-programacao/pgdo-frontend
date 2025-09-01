import { Component, HostListener, OnDestroy, OnInit } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { CommonModule } from "@angular/common";
import { Subscription } from "rxjs";
import { ToastComponent } from './core/toast/toast/toast.component'; 
import { AuthService } from "./core/auth/auth.service";
import { AudioUnlockService } from "./core/audio/audio-unlock.service";
import { WsService } from "./core/websocket/ws.service";

@Component({
  selector: "app-root",
  imports: [RouterOutlet, CommonModule, ToastComponent],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
  providers: [],
})
export class AppComponent implements OnInit, OnDestroy {
  constructor(
    private authService: AuthService,
    private audioUnlockService: AudioUnlockService,
    private wsService: WsService
  ) {}

  ngOnInit() {
    const token = localStorage.getItem("pgdo_access_token");
    if (token) {
      this.wsService.initWebSocket();
    }
    this.wsService.notifications$.subscribe((msg) => {
      console.log("Evento recebido globalmente:", msg);
    });
  }

  private subs: Subscription[] = [];

  @HostListener("window:click")
  onFirstClick() {
    this.audioUnlockService.unlockAudio();
  }

  ngOnDestroy(): void {
    console.log(
      "[AppComponent] ngOnDestroy: Limpando subscriptions e desconectando WebSocket..."
    );
    this.subs.forEach((sub) => sub.unsubscribe());
  }

  private isAdmin(): boolean {
    const user = this.authService.currentUserSubject.value;
    return (
      this.authService.isAuthenticated() &&
      Array.isArray(user?.roles) &&
      user.roles.includes("ROLE_ADMIN")
    );
  }

  getCurrentUserId(): string | null {
    return this.authService.currentUserSubject.value?.employeeId ?? null;
  }
}
