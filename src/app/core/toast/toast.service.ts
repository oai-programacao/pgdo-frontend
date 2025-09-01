// toast.service.ts
import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export interface ToastMessage {
  message: string;
  type: 'success' | 'info' | 'error';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private messagesSubject = new Subject<ToastMessage>();
  messages$: Observable<ToastMessage> = this.messagesSubject.asObservable();

  show(message: string, type: 'success' | 'info' | 'error' = 'info') {
    this.messagesSubject.next({ message, type });
  }
}
