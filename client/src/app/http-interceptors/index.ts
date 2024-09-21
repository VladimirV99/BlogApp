import { Provider } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { JwtInterceptor } from './jwt.interceptor';

export const httpInterceptorProviders: Provider[] = [
  { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
];
