import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { APP_NAME, ROUTES } from '../../../core';
import { EmailAlreadyExistsError } from '../../../core/errors/auth.errors';
import { AuthService } from '../../../services';

@Component({
  selector: 'app-register',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    RouterLink,
  ],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly appName = APP_NAME;
  protected readonly routes = ROUTES;

  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly registrationSuccess = signal(false);
  protected readonly activationToken = signal<string | null>(null);
  protected hidePassword = true;
  protected hideConfirmPassword = true;

  protected readonly registerForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    confirmPassword: ['', [Validators.required, RegisterComponent.confirmPasswordMatchValidator]],
  });

  constructor() {
    this.registerForm.controls.password.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.registerForm.controls.confirmPassword.updateValueAndValidity({ emitEvent: false });
      });
  }

  protected async onSubmit(): Promise<void> {
    this.errorMessage.set(null);

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const { email, password } = this.registerForm.getRawValue();
    this.isLoading.set(true);

    try {
      const token = await this.authService.register(email, password);
      this.activationToken.set(token);
      this.registrationSuccess.set(true);
    } catch (error) {
      this.errorMessage.set(this.resolveErrorMessage(error));
    } finally {
      this.isLoading.set(false);
    }
  }

  protected getActivationLink(): string {
    const token = this.activationToken();

    if (!token) {
      return ROUTES.activation;
    }

    return `${ROUTES.activation}?token=${encodeURIComponent(token)}`;
  }

  protected hasError(
    controlName: 'email' | 'password' | 'confirmPassword',
    errorCode: string,
  ): boolean {
    const control = this.registerForm.controls[controlName];
    return control.hasError(errorCode) && (control.dirty || control.touched);
  }

  private resolveErrorMessage(error: unknown): string {
    if (this.isEmailAlreadyExistsError(error)) {
      return error.message;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'Unable to create your account. Please try again.';
  }

  private isEmailAlreadyExistsError(error: unknown): error is EmailAlreadyExistsError {
    return (
      error instanceof EmailAlreadyExistsError ||
      (error instanceof Error && error.name === 'EmailAlreadyExistsError')
    );
  }

  private static confirmPasswordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const confirmPassword = control.value as string;
    const password = control.parent?.get('password')?.value as string | undefined;

    if (!confirmPassword || !password) {
      return null;
    }

    return password === confirmPassword ? null : { passwordMismatch: true };
  }
}
