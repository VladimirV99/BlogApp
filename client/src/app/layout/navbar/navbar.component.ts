import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { UiService } from '../../services/ui.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {
  userMenuVisible: boolean = false;

  public constructor(
    public authService: AuthService,
    public uiService: UiService,
    private router: Router
  ) {}

  onLogoutClick(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  toggleDarkMode(event: any): void {
    this.uiService.setDarkMode(event.target.checked);
  }

  toggleRoundIcons(event: any): void {
    this.uiService.setRoundIcons(event.target.checked);
  }

  toggleUserMenu(): void {
    if (!this.userMenuVisible) this.uiService.openDropdown('navbarUser');
    this.userMenuVisible = !this.userMenuVisible;
  }

  ngOnInit() {
    this.uiService.registerDropdown(
      'navbarUser',
      'dropdownUser',
      this.toggleUserMenu.bind(this),
      false
    );
  }
}
