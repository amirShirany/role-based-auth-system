export const APP_NAME = 'Demis project';

export const DATABASE_NAME = 'UserManagementDB';
export const DATABASE_VERSION = 2;

/** Dexie store definitions keyed by table name. */
export const DATABASE_STORES = {
  users: '++id, &email, role, isActive, activationToken',
} as const;
