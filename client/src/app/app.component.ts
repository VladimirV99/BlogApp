import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

import { UiService } from './services/ui.service';
import { NavbarComponent } from './layout/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, NavbarComponent, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  constructor(public uiService: UiService) {}

  hasParentWithId(element: Element | null, id: string): boolean {
    while (element != null) {
      if (element.id == id) return true;
      element = element.parentElement;
    }
    return false;
  }

  closeDropdowns(event: any): boolean {
    this.uiService.getDropdowns().forEach(element => {
      if (
        element.open &&
        ((event.target.id != element.toggle && event.target.tagName == 'A') ||
          !this.hasParentWithId(event.target, element.id))
      ) {
        element.open = false;
        element.callback();
      }
    });
    return true;
  }
}
