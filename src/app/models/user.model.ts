/**
 * Supported application roles for authorization (enforced in future auth layer).
 */
export const UserRole = {
  Admin: 'admin',
  User: 'user',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

/**
 * Persisted user entity stored in IndexedDB via Dexie.
 */
export interface User {
  id?: number;
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
  activationToken: string | null;
}

/** Input for inserting a new user record (auto-increment id is assigned by Dexie). */
export type CreateUserInput = Omit<User, 'id'>;

/** Input for replacing an existing user record. */
export type UpdateUserInput = User & { id: number };
