import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const jwtToken = localStorage.getItem('token');

    if (jwtToken) {
      return next.handle(
        req.clone({ setHeaders: { Authorization: `Bearer ${jwtToken}` } })
      );
    } else {
      return next.handle(req);
    }
  }
}
