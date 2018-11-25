import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UiService {

  darkMode: boolean;
  roundIcons: boolean;
  pagesToShow = 8;
  dropdowns: {id: string, toggle: string, callback: Function, open: boolean}[] = [];

  constructor() {
    let darkModeStorage = localStorage.getItem('dark-mode');
    if(darkModeStorage=="true")
      this.darkMode = true;
    else
      this.darkMode = false;
    let roundIconsStorage = localStorage.getItem('round-icons');
    if(roundIconsStorage=="true")
      this.roundIcons = true;
    else
      this.roundIcons = false;
  }

  setDarkMode(flag: boolean) {
    this.darkMode = flag;
    localStorage.setItem('dark-mode', this.darkMode ? "true" : "false");
  }

  setRoundIcons(flag: boolean) {
    this.roundIcons = flag;
    localStorage.setItem('round-icons', this.roundIcons ? "true" : "false");
  }

  getDropdowns() {
    return this.dropdowns;
  }

  registerDropdown(id: string, toggle: string, callback: Function, open: boolean) {
    this.dropdowns.push({id: id, toggle: toggle, callback: callback, open: open});
  }

  openDropdown(id) {
    for(let i = 0; i < this.dropdowns.length; i++){
      if(this.dropdowns[i].id == id){
        this.dropdowns[i].open = true;
        break;
      }
    }
  }

}
