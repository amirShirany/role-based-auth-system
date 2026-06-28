import { Injectable } from '@angular/core';

import { ADMIN_ACCOUNT } from '../core/constants/admin.constants';
import { AUTH_SESSION_STORAGE_KEY } from '../core/constants/auth.constants';
import {
  EmailAlreadyExistsError,
  InactiveAccountError,
  InvalidActivationTokenError,
  InvalidCredentialsError,
} from '../core/errors/auth.errors';
import type { AuthSession } from '../models/auth-session.model';
import { UserRole, type User } from '../models';
import { DatabaseService } from './database.service';
import { PasswordService } from './password.service';
import { UserService } from './user.service';

/**
 * Authentication and session management service.
 * Orchestrates user persistence through {@link UserService} without accessing Dexie directly.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private adminInitialization: Promise<void> | null = null;

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly userService: UserService,
    private readonly passwordService: PasswordService,
  ) {}

  async register(email: string, password: string): Promise<string> {
    await this.ensureAdminExists();

    const normalizedEmail = this.normalizeEmail(email);
    this.assertNonEmpty(normalizedEmail, 'Email is required.');
    this.assertNonEmpty(password, 'Password is required.');

    if (await this.emailExists(normalizedEmail)) {
      throw new EmailAlreadyExistsError(normalizedEmail);
    }

    const hashedPassword = await this.passwordService.hash(password);
    const activationToken = this.generateActivationToken();

    if (await this.emailExists(normalizedEmail)) {
      throw new EmailAlreadyExistsError(normalizedEmail);
    }

    try {
      await this.userService.create({
        email: normalizedEmail,
        password: hashedPassword,
        role: UserRole.User,
        isActive: false,
        activationToken,
      });
    } catch (error) {
      if (this.isDuplicateEmailError(error)) {
        throw new EmailAlreadyExistsError(normalizedEmail);
      }

      throw error;
    }

    return activationToken;
  }

  async login(email: string, password: string): Promise<AuthSession> {
    await this.ensureAdminExists();

    const normalizedEmail = this.normalizeEmail(email);
    this.assertNonEmpty(normalizedEmail, 'Email is required.');
    this.assertNonEmpty(password, 'Password is required.');

    const user = await this.userService.getByEmail(normalizedEmail);

    if (!user) {
      throw new InvalidCredentialsError();
    }

    const passwordMatches = await this.passwordService.verify(password, user.password);

    if (!passwordMatches) {
      throw new InvalidCredentialsError();
    }

    if (!user.isActive) {
      throw new InactiveAccountError();
    }

    const session = this.toAuthSession(user);
    this.persistSession(session);

    return session;
  }

  async activateAccount(token: string): Promise<AuthSession> {
    await this.ensureAdminExists();

    this.assertNonEmpty(token, 'Activation token is required.');

    const user = await this.userService.getByActivationToken(token);

    if (!user?.id) {
      throw new InvalidActivationTokenError();
    }

    const activatedUser: User = {
      ...user,
      isActive: true,
      activationToken: null,
    };

    await this.userService.update({
      ...activatedUser,
      id: user.id,
    });

    const session = this.toAuthSession(activatedUser);
    this.persistSession(session);

    return session;
  }

  logout(): void {
    localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
  }

  getCurrentUser(): AuthSession | null {
    return this.readSession();
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  private ensureAdminExists(): Promise<void> {
    if (!this.adminInitialization) {
      this.adminInitialization = this.createAdminIfMissing().catch((error) => {
        this.adminInitialization = null;
        return Promise.reject(error);
      });
    }

    return this.adminInitialization;
  }

  private async createAdminIfMissing(): Promise<void> {
    await this.databaseService.initialize();

    const normalizedEmail = this.normalizeEmail(ADMIN_ACCOUNT.email);
    const existingAdmin = await this.userService.getByEmail(normalizedEmail);

    if (existingAdmin) {
      return;
    }

    const hashedPassword = await this.passwordService.hash(ADMIN_ACCOUNT.password);

    await this.userService.create({
      email: normalizedEmail,
      password: hashedPassword,
      role: UserRole.Admin,
      isActive: true,
      activationToken: null,
    });
  }

  private persistSession(session: AuthSession): void {
    localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session));
  }

  private readSession(): AuthSession | null {
    const rawSession = localStorage.getItem(AUTH_SESSION_STORAGE_KEY);

    if (!rawSession) {
      return null;
    }

    try {
      return JSON.parse(rawSession) as AuthSession;
    } catch {
      this.logout();
      return null;
    }
  }

  private toAuthSession(user: User): AuthSession {
    if (user.id === undefined) {
      throw new Error('Cannot create a session for a user without an id.');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    };
  }

  private generateActivationToken(): string {
    return crypto.randomUUID();
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private async emailExists(normalizedEmail: string): Promise<boolean> {
    const existingUser = await this.userService.getByEmail(normalizedEmail);

    if (existingUser) {
      return true;
    }

    const users = await this.userService.getAll();
    return users.some((user) => this.normalizeEmail(user.email) === normalizedEmail);
  }

  private isDuplicateEmailError(error: unknown): boolean {
    return error instanceof Error && error.name === 'ConstraintError';
  }

  private assertNonEmpty(value: string, message: string): void {
    if (!value.trim()) {
      throw new Error(message);
    }
  }
}
