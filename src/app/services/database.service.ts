import { Injectable } from '@angular/core';

import { AppDatabase } from '../database/app.database';

/**
 * Manages the lifecycle of the Dexie database instance.
 * Repositories receive database access through this service.
 */
@Injectable({ providedIn: 'root' })
export class DatabaseService {
  private readonly db = new AppDatabase();
  private initialized = false;

  get database(): AppDatabase {
    return this.db;
  }

  get isInitialized(): boolean {
    return this.initialized;
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    await this.db.open();
    this.initialized = true;
  }
}
