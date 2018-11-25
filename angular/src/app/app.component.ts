import { Component } from '@angular/core';
import * as $ from 'jquery';
import { UiService } from './services/ui.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(private uiService: UiService) {

  }

  closeDropdowns(event) {
    this.uiService.getDropdowns().forEach(element => {
      if(element.open && (($(event.target)[0].id != element.toggle && $(event.target)[0].tagName == 'A') ||  $(event.target).parents('#'+element.id).length==0)){
        element.open = false;
        element.callback();
      }
    });
    return true;
  }

}
