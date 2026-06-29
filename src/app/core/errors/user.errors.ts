/** Thrown when a user record cannot be found. */
export class UserNotFoundError extends Error {
  constructor() {
    super('User not found.');
    this.name = 'UserNotFoundError';
  }
}

/** Thrown when an operation targets the protected administrator account. */
export class AdminAccountProtectedError extends Error {
  constructor(operation: string) {
    super(`The admin account cannot be ${operation}.`);
    this.name = 'AdminAccountProtectedError';
  }
}
