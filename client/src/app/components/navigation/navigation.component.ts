import {Component, Input} from '@angular/core';
import {Router} from '@angular/router';

import {LoginComponent} from '../login/login.component';
import {OptionsComponent} from '../options/options.component';
import {OverviewComponent} from '../overview/overview.component';
import {AuthenticationService} from '../../services';
import {DeviceDetailsComponent} from "../detail/device-details.component";

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html'
})
export class NavigationComponent {

  @Input()
  component = null;

  constructor(private readonly router: Router, private readonly authenticationService: AuthenticationService) {
  }

  logout(): void {
    this.authenticationService.logout();
    // noinspection JSIgnoredPromiseFromCall
    this.router.navigate(['/login']);
  }

  get showOverviewLink(): boolean {
    return this.loggedIn && !(this.component instanceof OverviewComponent);
  }

  get showOptionsLink(): boolean {
    return this.loggedIn && !(this.component instanceof OptionsComponent);
  }

  get loggedIn(): boolean {
    return !(this.component instanceof LoginComponent);
  }
}
