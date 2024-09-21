import { Injectable } from '@angular/core';

import { API_URL } from '../../environments/environment';
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
  private darkMode: boolean = false;
  private roundIcons: boolean = true;
  private pagesToShow = 8;
  private dropdowns: Dropdown[] = [];

  constructor(private authService: AuthService) {
    this.loadSettings();
  }

  loadSettings(): void {
    if (this.authService.loggedIn()) {
      this.darkMode = this.authService.getUser()?.dark_mode || false;
      this.roundIcons = this.authService.getUser()?.round_icons || false;
    } else {
      this.darkMode = localStorage.getItem('dark-mode') == 'true';
      this.roundIcons = localStorage.getItem('round-icons') == 'true';
    }
  }

  getDarkMode(): boolean {
    return this.darkMode;
  }

  setDarkMode(flag: boolean): void {
    this.darkMode = flag;
    this.authService.setDarkMode(flag).subscribe(data => {
      if (data.success) {
        this.authService.getUser()!.dark_mode = flag;
        this.authService.saveUser();
        localStorage.setItem('dark-mode', this.darkMode ? 'true' : 'false');
      }
    });
  }

  getRoundIcons(): boolean {
    return this.roundIcons;
  }

  setRoundIcons(flag: boolean): void {
    this.roundIcons = flag;
    this.authService.setRoundIcons(flag).subscribe(data => {
      if (data.success) {
        this.authService.getUser()!.round_icons = flag;
        this.authService.saveUser();
        localStorage.setItem('round-icons', this.roundIcons ? 'true' : 'false');
      }
    });
  }

  getPhoto(photo: string): string {
    return API_URL + photo;
  }

  noPhoto(): string {
    return API_URL + 'uploads/no-user.png';
  }

  getPagesToShow(): number {
    return this.pagesToShow;
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
    for (let dropdown of this.dropdowns) {
      if (dropdown.id == id) {
        dropdown.open = true;
        break;
      }
    }
  }
}
