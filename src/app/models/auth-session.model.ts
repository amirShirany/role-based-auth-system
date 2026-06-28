import type { UserRole } from './user.model';

/**
 * Authenticated user representation exposed to the application layer.
 * Password and activation token are intentionally excluded.
 */
export interface AuthSession {
  id: number;
  email: string;
  role: UserRole;
  isActive: boolean;
}
