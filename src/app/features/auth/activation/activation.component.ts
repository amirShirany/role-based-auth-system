import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { APP_NAME, ROUTES } from '../../../core';
import { InvalidActivationTokenError } from '../../../core/errors/auth.errors';
import { AuthService } from '../../../services';

@Component({
  selector: 'app-activation',
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule, RouterLink],
  templateUrl: './activation.component.html',
})
export class ActivationComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  protected readonly appName = APP_NAME;
  protected readonly routes = ROUTES;

  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);

  ngOnInit(): void {
    void this.activateFromRoute();
  }

  private async activateFromRoute(): Promise<void> {
    const token = this.route.snapshot.queryParamMap.get('token')?.trim();

    if (!token) {
      this.errorMessage.set('Activation token is missing. Please use the link from your registration email.');
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    try {
      await this.authService.activateAccount(token);
      this.isLoading.set(false);
      this.successMessage.set('Your account has been activated successfully.');
      await this.router.navigateByUrl(ROUTES.home);
    } catch (error) {
      this.errorMessage.set(this.resolveErrorMessage(error));
    } finally {
      this.isLoading.set(false);
    }
  }

  private resolveErrorMessage(error: unknown): string {
    if (
      error instanceof InvalidActivationTokenError ||
      (error instanceof Error && error.name === 'InvalidActivationTokenError')
    ) {
      return error.message;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'Unable to activate your account. Please try again.';
  }
}
