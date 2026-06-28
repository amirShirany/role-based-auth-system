import { Component, DestroyRef, inject, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { filter } from 'rxjs';

import { APP_NAME, ROUTES } from '../../../core';
import { UserRole } from '../../../models';
import { AuthService } from '../../../services';

@Component({
  selector: 'app-toolbar',
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.scss',
})
export class ToolbarComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild('mobileNav') private mobileNav?: MatSidenav;

  protected readonly appName = APP_NAME;
  protected readonly routes = ROUTES;
  protected readonly toolbarHeightPx = 64;

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.closeMobileNav());

    this.breakpointObserver
      .observe('(min-width: 992px)')
      .pipe(
        filter((state) => state.matches),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.closeMobileNav());
  }

  protected get isGuest(): boolean {
    return !this.authService.isAuthenticated();
  }

  protected get isAdmin(): boolean {
    return this.authService.getCurrentUser()?.role === UserRole.Admin;
  }

  protected get isAuthenticatedUser(): boolean {
    return this.authService.isAuthenticated() && !this.isAdmin;
  }

  protected get brandLink(): string {
    return this.isGuest ? this.routes.login : this.routes.home;
  }

  protected toggleMobileNav(): void {
    void this.mobileNav?.toggle();
  }

  protected closeMobileNav(): void {
    void this.mobileNav?.close();
  }

  protected logout(): void {
    this.authService.logout();
    void this.router.navigateByUrl(this.routes.login);
  }
}
