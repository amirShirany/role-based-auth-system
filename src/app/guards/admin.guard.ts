import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { ROUTES } from '../core';
import { UserRole } from '../models';
import { AuthService } from '../services';

/**
 * Allows navigation only for authenticated administrators.
 * Non-admin users are redirected to the home page.
 */
export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const currentUser = authService.getCurrentUser();

  if (currentUser?.role === UserRole.Admin) {
    return true;
  }

  return router.parseUrl(ROUTES.home);
};
