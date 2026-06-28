import { Injectable } from '@angular/core';

const PBKDF2_ITERATIONS = 100_000;
const PBKDF2_HASH_LENGTH_BITS = 256;
const SALT_LENGTH_BYTES = 16;

/**
 * Handles password hashing and verification using the Web Crypto API (PBKDF2).
 * Authentication code must delegate to this service instead of hashing directly.
 */
@Injectable({ providedIn: 'root' })
export class PasswordService {
  private readonly encoder = new TextEncoder();

  async hash(password: string): Promise<string> {
    const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH_BYTES));
    const derivedHash = await this.deriveKey(password, salt);

    return `${this.toBase64(salt)}:${this.toBase64(derivedHash)}`;
  }

  async verify(plainPassword: string, storedHash: string): Promise<boolean> {
    const [saltBase64, hashBase64] = storedHash.split(':');

    if (!saltBase64 || !hashBase64) {
      return false;
    }

    const salt = this.fromBase64(saltBase64);
    const expectedHash = this.fromBase64(hashBase64);
    const actualHash = await this.deriveKey(plainPassword, salt);

    return this.timingSafeEqual(expectedHash, actualHash);
  }

  private async deriveKey(password: string, salt: Uint8Array): Promise<Uint8Array> {
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      this.encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits'],
    );

    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: this.toBufferSource(salt),
        iterations: PBKDF2_ITERATIONS,
        hash: 'SHA-256',
      },
      keyMaterial,
      PBKDF2_HASH_LENGTH_BITS,
    );

    return new Uint8Array(derivedBits);
  }

  private toBase64(bytes: Uint8Array): string {
    return btoa(String.fromCharCode(...bytes));
  }

  private fromBase64(value: string): Uint8Array {
    return Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
  }

  /** Ensures Uint8Array values satisfy strict Web Crypto BufferSource typing. */
  private toBufferSource(bytes: Uint8Array): BufferSource {
    const copy = new Uint8Array(bytes.byteLength);
    copy.set(bytes);
    return copy;
  }

  /** Prevents timing attacks when comparing password hashes. */
  private timingSafeEqual(left: Uint8Array, right: Uint8Array): boolean {
    if (left.length !== right.length) {
      return false;
    }

    let result = 0;

    for (let index = 0; index < left.length; index++) {
      result |= left[index]! ^ right[index]!;
    }

    return result === 0;
  }
}
