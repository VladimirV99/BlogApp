import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  private redirectUrl: string | null;

  constructor(private authService: AuthService, private router: Router) {
    this.redirectUrl = null;
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (this.authService.loggedIn()) {
      return true;
    } else {
      this.redirectUrl = state.url;
      this.router.navigate(['/login']);
      return false;
    }
  }

  public getRedirectUrl() {
    return this.redirectUrl;
  }

  public resetRedirectUrl() {
    this.redirectUrl = null;
  }
}
