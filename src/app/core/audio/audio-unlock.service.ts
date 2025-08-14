import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioUnlockService {
private audioUnlocked = false;
  constructor() { }

  public unlockAudio(){
    if(this.audioUnlocked) return;


    const audio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA');

    audio.play().then(() => {
      this.audioUnlocked = true;
      console.log('Contexto de áudio desbloqueado.');
      }).catch(() => {});
  }

  public canPlayAudio(): boolean {
    return this.audioUnlocked;
  }
}
