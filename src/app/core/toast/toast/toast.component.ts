import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ToastService, ToastMessage } from "../toast.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-toast",
  standalone: true, 
  imports: [CommonModule], 
  template: `
    <div class="toast-container">
      <div *ngFor="let toast of toasts" class="toast {{ toast.type }}">
        {{ toast.message }}
      </div>
    </div>
  `,
  styles: [
    `
      .toast-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .toast {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 280px;
        padding: 14px 18px;
        border-radius: 12px;
        color: white;
        font-size: 14px;
        font-weight: 500;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
        animation: slideIn 0.3s ease, fadeOut 0.3s ease 4.5s forwards;
      }

      /* Ícone genérico de alarme */
      .toast::before {
        content: "🚨";
        font-size: 18px;
      }

      .success {
        background: linear-gradient(135deg, #28a745, #218838);
      }
      .info {
        background: linear-gradient(135deg, #007bff, #0069d9);
      }
      .error {
        background: linear-gradient(135deg, #dc3545, #c82333);
      }

      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateX(100%);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      @keyframes fadeOut {
        to {
          opacity: 0;
          transform: translateX(100%);
        }
      }
    `,
  ],
})
export class ToastComponent implements OnInit {
  toasts: ToastMessage[] = [];
  private sub!: Subscription;

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.sub = this.toastService.messages$.subscribe((msg) => {
      this.toasts.push(msg);
      setTimeout(() => this.removeToast(msg), 3000);
    });
  }

  removeToast(msg: ToastMessage) {
    this.toasts = this.toasts.filter((t) => t !== msg);
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
