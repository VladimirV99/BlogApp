import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

export interface Dropdown {
  id: string;
  toggle: string;
  callback: Function;
  open: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UiService {
  private darkMode: boolean;
  private roundIcons: boolean;
  private pagesToShow = 8;
  private dropdowns: Dropdown[] = [];

  constructor(private authService: AuthService) {
    this.loadSettings();
  }

  loadSettings(): void {
    if (this.authService.loggedIn()) {
      if (this.authService.getUser().dark_mode)
        this.darkMode = this.authService.getUser().dark_mode;
      else this.darkMode = false;
    } else {
      if (localStorage.getItem('dark-mode') == 'true') this.darkMode = true;
      else this.darkMode = false;
    }
    if (this.authService.loggedIn()) {
      if (this.authService.getUser().round_icons)
        this.roundIcons = this.authService.getUser().round_icons;
      else this.roundIcons = false;
    } else {
      if (localStorage.getItem('round-icons') == 'true') this.roundIcons = true;
      else this.roundIcons = false;
    }
  }

  getDarkMode(): boolean {
    return this.darkMode;
  }

  getRoundIcons(): boolean {
    return this.roundIcons;
  }

  noPhoto(): string {
    return this.authService.getDomain() + 'uploads/no-user.png';
  }

  getPhoto(photo: string): string {
    return this.authService.getDomain() + photo;
  }

  getPagesToShow(): number {
    return this.pagesToShow;
  }

  setDarkMode(flag: boolean): void {
    this.darkMode = flag;
    this.authService.setDarkMode(flag).subscribe(data => {
      if (data.success) {
        this.authService.getUser().dark_mode = flag;
        this.authService.storeUser(this.authService.getUser());
        localStorage.setItem('dark-mode', this.darkMode ? 'true' : 'false');
      }
    });
  }

  setRoundIcons(flag: boolean): void {
    this.roundIcons = flag;
    this.authService.setRoundIcons(flag).subscribe(data => {
      if (data.success) {
        this.authService.getUser().round_icons = flag;
        this.authService.storeUser(this.authService.getUser());
        localStorage.setItem('round-icons', this.roundIcons ? 'true' : 'false');
      }
    });
  }

  getDropdowns(): Dropdown[] {
    return this.dropdowns;
  }

  registerDropdown(
    id: string,
    toggle: string,
    callback: Function,
    open: boolean
  ): void {
    this.dropdowns.push({ id, toggle, callback, open });
  }

  openDropdown(id: string): void {
    for (let i = 0; i < this.dropdowns.length; i++) {
      if (this.dropdowns[i].id == id) {
        this.dropdowns[i].open = true;
        break;
      }
    }
  }
}
