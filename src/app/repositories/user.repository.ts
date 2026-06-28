import { Injectable } from '@angular/core';
import type { Table } from 'dexie';

import type { CreateUserInput, UpdateUserInput, User } from '../models';
import { DatabaseService } from '../services/database.service';

/**
 * Data-access layer for the {@link User} entity.
 * Contains persistence operations only — no business rules.
 */
@Injectable({ providedIn: 'root' })
export class UserRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(user: CreateUserInput): Promise<number> {
    return this.users.add(user);
  }

  async update(user: UpdateUserInput): Promise<number> {
    await this.users.put(user);
    return user.id;
  }

  async delete(id: number): Promise<void> {
    await this.users.delete(id);
  }

  async getById(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getByEmail(email: string): Promise<User | undefined> {
    return this.users.where('email').equals(email).first();
  }

  async getByActivationToken(token: string): Promise<User | undefined> {
    return this.users.where('activationToken').equals(token).first();
  }

  async getAll(): Promise<User[]> {
    return this.users.toArray();
  }

  private get users(): Table<User, number> {
    if (!this.databaseService.isInitialized) {
      throw new Error('Database has not been initialized.');
    }

    return this.databaseService.database.users;
  }
}
