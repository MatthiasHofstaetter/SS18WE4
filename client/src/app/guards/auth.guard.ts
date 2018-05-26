import {Injectable} from '@angular/core';
import {Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import {AuthenticationService} from '../services';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private readonly router: Router, private readonly authenticationService: AuthenticationService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (this.authenticationService.isLoggedIn) {
      return true;
    }
    // noinspection JSIgnoredPromiseFromCall
    this.router.navigate(['/login']);
    return false;
  }
}
