import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PrimeNGConfigType } from 'primeng/config';
import { Subscription } from 'rxjs';
import { AuthService } from './core/auth/auth.service';
// import { SseService } from './core/sse/sse.service';

@Component({
  selector: "app-root",
  imports: [RouterOutlet, CommonModule],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
})
export class AppComponent {
  
}
