import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { APP_NAME, ROUTES } from '../../../core';
import {
  InactiveAccountError,
  InvalidCredentialsError,
} from '../../../core/errors/auth.errors';
import { AuthService } from '../../../services';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    RouterLink,
  ],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly appName = APP_NAME;
  protected readonly routes = ROUTES;

  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected hidePassword = true;

  protected readonly loginForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  protected async onSubmit(): Promise<void> {
    this.errorMessage.set(null);

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { email, password } = this.loginForm.getRawValue();
    this.isLoading.set(true);

    try {
      await this.authService.login(email, password);
      await this.router.navigateByUrl(ROUTES.home);
    } catch (error) {
      this.errorMessage.set(this.resolveErrorMessage(error));
    } finally {
      this.isLoading.set(false);
    }
  }

  protected hasError(controlName: 'email' | 'password', errorCode: string): boolean {
    const control = this.loginForm.controls[controlName];
    return control.hasError(errorCode) && (control.dirty || control.touched);
  }

  private resolveErrorMessage(error: unknown): string {
    if (error instanceof InvalidCredentialsError) {
      return error.message;
    }

    if (error instanceof InactiveAccountError) {
      return 'Account is not activated. Please activate your account before signing in.';
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'Unable to sign in. Please try again.';
  }
}
