import {Component} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  component = null;

  jumpTo(id): void {
    const content = document.getElementById(id);
    if (content) {
      content.scrollIntoView();
    }
  }
}
