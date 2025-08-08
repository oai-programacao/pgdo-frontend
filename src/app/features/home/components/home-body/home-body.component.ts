import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-home-body',
  imports: [CommonModule],
  templateUrl: './home-body.component.html',
  styleUrl: './home-body.component.scss'
})
export class HomeBodyComponent implements OnInit{
  userName!: string;
  userRole!: any;
  authService = inject(AuthService);

  ngOnInit() {
    const user = this.authService.currentUserSubject.value;
    this.userName = user?.name || 'Usuário';
  }

 ngAfterViewInit() {
  // Typewriter
  const words = [
    '<span class="text-sky-400">Original</span>, <span class="text-yellow-400">Autêntica</span> e <span class="text-purple-400">Interativa</span>.'
  ];
  let i = 0, j = 0, currentWord = '', isDeleting = false;
  const speed = 50;
  const typeEl = document.getElementById('typewriter');

  function type() {
    currentWord = words[i];
    if (!isDeleting) {
      typeEl!.innerHTML = currentWord.substring(0, j + 1);
      j++;
      if (j === currentWord.length) isDeleting = true;
    } else {
      typeEl!.innerHTML = currentWord.substring(0, j - 1);
      j--;
      if (j === 0) {
        isDeleting = false;
        i = (i + 1) % words.length;
      }
    }
    setTimeout(type, isDeleting ? speed / 3 : speed);
  }
  type();

  // Partículas simples
  const particlesContainer = document.getElementById('particles')!;
  for (let p = 0; p < 25; p++) {
    const particle = document.createElement('div');
    particle.className = 'absolute bg-sky-400/20 rounded-full';
    particle.style.width = `${Math.random() * 4 + 2}px`;
    particle.style.height = particle.style.width;
    particle.style.top = `${Math.random() * 100}%`;
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.animation = `float ${5 + Math.random() * 10}s infinite linear`;
    particlesContainer.appendChild(particle);
  }
}


}
