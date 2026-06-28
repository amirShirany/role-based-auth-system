import type { UserRole } from './user.model';

export interface CreateManagedUserInput {
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
}

export interface UpdateManagedUserInput {
  id: number;
  email: string;
  role: UserRole;
  isActive: boolean;
}
