import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { APP_NAME, ROUTES } from '../../core';
import { UserRole } from '../../models';
import { AuthService, UserService } from '../../services';

@Component({
  selector: 'app-home',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RouterLink,
  ],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);

  protected readonly appName = APP_NAME;
  protected readonly routes = ROUTES;

  protected readonly statsLoading = signal(false);
  protected readonly totalUsers = signal(0);
  protected readonly activeUsers = signal(0);
  protected readonly inactiveUsers = signal(0);

  protected get isGuest(): boolean {
    return !this.authService.isAuthenticated();
  }

  protected get isAdmin(): boolean {
    return this.authService.getCurrentUser()?.role === UserRole.Admin;
  }

  protected get isAuthenticatedUser(): boolean {
    return this.authService.isAuthenticated() && !this.isAdmin;
  }

  protected get currentUser() {
    return this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    if (this.isAdmin) {
      void this.loadAdminStats();
    }
  }

  private async loadAdminStats(): Promise<void> {
    this.statsLoading.set(true);

    try {
      const users = await this.userService.getAllUsers();
      this.totalUsers.set(users.length);
      this.activeUsers.set(users.filter((user) => user.isActive).length);
      this.inactiveUsers.set(users.filter((user) => !user.isActive).length);
    } finally {
      this.statsLoading.set(false);
    }
  }
}
