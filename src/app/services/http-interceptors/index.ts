import { CommonInterceptor } from './common.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

export const httpInterceptorProvides = [
  { provide: HTTP_INTERCEPTORS, useClass: CommonInterceptor, multi: true}
];
