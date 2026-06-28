import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ToolbarComponent } from '../components/toolbar/toolbar.component';

@Component({
  selector: 'app-main-layout',
  imports: [ToolbarComponent, RouterOutlet],
  templateUrl: './main-layout.component.html',
})
export class MainLayoutComponent {}
