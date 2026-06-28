import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { APP_NAME } from '../../core';

@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet, MatCardModule, MatIconModule],
  templateUrl: './auth-layout.component.html',
  styleUrl: './auth-layout.component.scss',
})
export class AuthLayoutComponent {
  protected readonly appName = APP_NAME;
}
