import { CanActivateFn } from "@angular/router";

// Guard liberado para qualquer rota (comentado para testes na Vercel)
// import { inject } from "@angular/core";
// import { Router } from "@angular/router";
// import { AuthService } from "./auth.service";
// import { map, take } from "rxjs/operators";

// export const authGuard: CanActivateFn = (route, state) => {
//   const authService = inject(AuthService);
//   const router = inject(Router);

//   // Usar isLoggedIn$ para uma verificação reativa
//   return authService.isLoggedIn$.pipe(
//     take(1), // Pega o primeiro valor e completa, evitando múltiplas execuções
//     map((isLoggedIn) => {
//       if (isLoggedIn) {
//         return true;
//       } else {
//         router.navigate(["/login"]); // Redireciona para a página de login (path '')
//         return false;
//       }
//     })
//   );
// };

export const authGuard: CanActivateFn = (route, state) => {
  return true;
};