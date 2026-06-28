import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { ROUTES } from '../core';
import { AuthService } from '../services';

/**
 * Allows navigation only for authenticated users.
 * Unauthenticated visitors are redirected to the login page.
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  return router.parseUrl(ROUTES.login);
};
