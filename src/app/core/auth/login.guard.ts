import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "./auth.service";
import { map, take } from "rxjs/operators";

export const loginGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isLoggedIn$.pipe(
    take(1),
    map((isLoggedIn) => {
      if (isLoggedIn) {
        router.navigate(["app/home"]); // Usuário logado, redireciona para home
        return false;
      } else {
        return true; // Usuário não logado, permite acesso à página de login
      }
    })
  );
};
