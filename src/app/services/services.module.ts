import { environment } from './../../environments/environment.prod';
import { httpInterceptorProvides } from './http-interceptors/index';
import { NgModule, InjectionToken, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const API_CONFIG = new InjectionToken('ApiConfigToken');
export const WINDOW = new InjectionToken('WindowToken');

@NgModule({
  declarations: [],
  imports: [],
  providers: [
    {
      provide: API_CONFIG, useValue: environment.production ? '/' : '/api/'
    },
    {
      provide: WINDOW,
      useFactory(platfromId: object): Window | object {
        return isPlatformBrowser(platfromId) ? window : {};
      },
      deps: [PLATFORM_ID]
    },
    httpInterceptorProvides
  ],
})
export class ServicesModule { }
