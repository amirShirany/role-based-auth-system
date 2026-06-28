/** Thrown when registration is attempted with an email that is already in use. */
export class EmailAlreadyExistsError extends Error {
  constructor(email: string) {
    super(`An account with email "${email}" already exists.`);
    this.name = 'EmailAlreadyExistsError';
  }
}

/** Thrown when login credentials are invalid. */
export class InvalidCredentialsError extends Error {
  constructor() {
    super('Invalid email or password.');
    this.name = 'InvalidCredentialsError';
  }
}

/** Thrown when a user attempts to log in before activating their account. */
export class InactiveAccountError extends Error {
  constructor() {
    super('Account is not activated. Please activate your account before signing in.');
    this.name = 'InactiveAccountError';
  }
}

/** Thrown when an activation token cannot be matched to a user. */
export class InvalidActivationTokenError extends Error {
  constructor() {
    super('Invalid or expired activation token.');
    this.name = 'InvalidActivationTokenError';
  }
}
