import { Injectable } from '@angular/core';

import { ADMIN_ACCOUNT } from '../core/constants/admin.constants';
import { EmailAlreadyExistsError } from '../core/errors/auth.errors';
import { AdminAccountProtectedError, UserNotFoundError } from '../core/errors/user.errors';
import type {
  CreateManagedUserInput,
  CreateUserInput,
  UpdateManagedUserInput,
  UpdateUserInput,
  User,
} from '../models';
import { UserRepository } from '../repositories/user.repository';
import { DatabaseService } from './database.service';
import { PasswordService } from './password.service';

/**
 * Application service for user-related operations.
 * Delegates persistence to {@link UserRepository} and enforces user-management rules.
 */
@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly databaseService: DatabaseService,
    private readonly passwordService: PasswordService,
  ) {}

  create(user: CreateUserInput): Promise<number> {
    return this.userRepository.create(user);
  }

  update(user: UpdateUserInput): Promise<number> {
    return this.userRepository.update(user);
  }

  delete(id: number): Promise<void> {
    return this.userRepository.delete(id);
  }

  getById(id: number): Promise<User | undefined> {
    return this.userRepository.getById(id);
  }

  getByEmail(email: string): Promise<User | undefined> {
    return this.userRepository.getByEmail(email);
  }

  getByActivationToken(token: string): Promise<User | undefined> {
    return this.userRepository.getByActivationToken(token);
  }

  getAll(): Promise<User[]> {
    return this.userRepository.getAll();
  }

  async getAllUsers(): Promise<User[]> {
    await this.ensureDatabaseReady();
    return this.userRepository.getAll();
  }

  async createManagedUser(input: CreateManagedUserInput): Promise<number> {
    await this.ensureDatabaseReady();

    const normalizedEmail = this.normalizeEmail(input.email);
    this.assertRequired(normalizedEmail, 'Email is required.');
    this.assertRequired(input.password, 'Password is required.');
    this.assertRequired(input.role, 'Role is required.');
    this.assertRequiredStatus(input.isActive);

    if (await this.emailExists(normalizedEmail)) {
      throw new EmailAlreadyExistsError(normalizedEmail);
    }

    const hashedPassword = await this.passwordService.hash(input.password);

    return this.userRepository.create({
      email: normalizedEmail,
      password: hashedPassword,
      role: input.role,
      isActive: input.isActive,
      activationToken: input.isActive ? null : crypto.randomUUID(),
    });
  }

  async updateManagedUser(input: UpdateManagedUserInput): Promise<number> {
    await this.ensureDatabaseReady();

    const existingUser = await this.userRepository.getById(input.id);

    if (!existingUser) {
      throw new UserNotFoundError();
    }

    const isProtectedAdmin = this.isProtectedAdminAccount(existingUser);
    const normalizedEmail = this.normalizeEmail(input.email);

    this.assertRequired(normalizedEmail, 'Email is required.');
    this.assertRequired(input.role, 'Role is required.');
    this.assertRequiredStatus(input.isActive);

    if (isProtectedAdmin && normalizedEmail !== this.normalizeEmail(ADMIN_ACCOUNT.email)) {
      throw new AdminAccountProtectedError('The admin email cannot be changed.');
    }

    if (
      !isProtectedAdmin &&
      normalizedEmail !== this.normalizeEmail(existingUser.email) &&
      (await this.emailExists(normalizedEmail, existingUser.id))
    ) {
      throw new EmailAlreadyExistsError(normalizedEmail);
    }

    const updatedUser: UpdateUserInput = {
      ...existingUser,
      id: existingUser.id!,
      email: isProtectedAdmin ? this.normalizeEmail(ADMIN_ACCOUNT.email) : normalizedEmail,
      role: isProtectedAdmin ? existingUser.role : input.role,
      isActive: input.isActive,
      activationToken: input.isActive
        ? null
        : (existingUser.activationToken ?? crypto.randomUUID()),
    };

    return this.userRepository.update(updatedUser);
  }

  async deleteManagedUser(id: number): Promise<void> {
    await this.ensureDatabaseReady();

    const existingUser = await this.userRepository.getById(id);

    if (!existingUser) {
      throw new UserNotFoundError();
    }

    if (this.isProtectedAdminAccount(existingUser)) {
      throw new AdminAccountProtectedError('The admin account cannot be deleted.');
    }

    await this.userRepository.delete(id);
  }

  isProtectedAdminAccount(user: User): boolean {
    return this.normalizeEmail(user.email) === this.normalizeEmail(ADMIN_ACCOUNT.email);
  }

  private async ensureDatabaseReady(): Promise<void> {
    await this.databaseService.initialize();
  }

  private async emailExists(normalizedEmail: string, excludeUserId?: number): Promise<boolean> {
    const indexedMatch = await this.userRepository.getByEmail(normalizedEmail);

    if (indexedMatch && indexedMatch.id !== excludeUserId) {
      return true;
    }

    const users = await this.userRepository.getAll();
    return users.some(
      (user) => user.id !== excludeUserId && this.normalizeEmail(user.email) === normalizedEmail,
    );
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private assertRequired(value: string, message: string): void {
    if (!value.trim()) {
      throw new Error(message);
    }
  }

  private assertRequiredStatus(isActive: boolean | null | undefined): void {
    if (isActive === null || isActive === undefined) {
      throw new Error('Status is required.');
    }
  }
}
