import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { ROUTES } from '../core';
import { AuthService } from '../services';

/**
 * Allows navigation only for unauthenticated visitors.
 * Authenticated users are redirected to the home page.
 */
export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;
  }

  return router.parseUrl(ROUTES.home);
};
