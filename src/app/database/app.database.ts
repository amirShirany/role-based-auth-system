import Dexie, { type Table } from 'dexie';

import { DATABASE_NAME, DATABASE_STORES, DATABASE_VERSION } from '../core/constants/app.constants';
import type { User } from '../models';

/**
 * IndexedDB access point. Only repositories should interact with this class.
 */
export class AppDatabase extends Dexie {
  readonly users!: Table<User, number>;

  constructor() {
    super(DATABASE_NAME);

    this.version(1).stores({
      users: '++id, email, username, isActive',
    });

    this.version(DATABASE_VERSION).stores({
      users: DATABASE_STORES.users,
    });
  }
}
