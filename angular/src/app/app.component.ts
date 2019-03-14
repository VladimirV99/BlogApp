import { Component } from '@angular/core';
import { UiService } from './services/ui.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(private uiService: UiService) {

  }

  hasParentWithId(element, id) {
    while(element != null) {
      if(element.id == id)
        return true;
      element = element.parentElement;
    }
    return false;
  }

  closeDropdowns(event) {
    this.uiService.getDropdowns().forEach(element => {
      if(element.open && ((event.target.id != element.toggle && event.target.tagName == 'A') || !this.hasParentWithId(event.target, element.id))) {
        element.open = false;
        element.callback();
      }
    });
    return true;
  }

}
