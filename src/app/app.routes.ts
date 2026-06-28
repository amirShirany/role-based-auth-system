import { Routes } from '@angular/router';

import { ROUTES } from './core';
import { adminGuard, authGuard, guestGuard } from './guards';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { MainContentComponent } from './layouts/components/main-content/main-content.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        component: MainContentComponent,
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'home' },
          {
            path: 'home',
            canActivate: [authGuard],
            loadComponent: () =>
              import('./features/home/home.component').then((m) => m.HomeComponent),
          },
          {
            path: 'admin/users',
            canActivate: [authGuard, adminGuard],
            loadComponent: () =>
              import('./features/admin/users/admin-users.component').then(
                (m) => m.AdminUsersComponent,
              ),
          },
        ],
      },
    ],
  },
  {
    path: 'login',
    component: AuthLayoutComponent,
    canActivate: [guestGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/auth/login/login.component').then((m) => m.LoginComponent),
      },
    ],
  },
  {
    path: 'register',
    component: AuthLayoutComponent,
    canActivate: [guestGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
      },
    ],
  },
  {
    path: 'activation',
    component: AuthLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/auth/activation/activation.component').then(
            (m) => m.ActivationComponent,
          ),
      },
    ],
  },
  { path: '**', redirectTo: ROUTES.home.replace('/', '') },
];
