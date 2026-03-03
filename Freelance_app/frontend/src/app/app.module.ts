import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AuthInterceptor } from './services/auth.interceptor';
import { AuthService } from './services/auth';
import { Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, HttpClientModule],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    {
      provide: HTTP_INTERCEPTORS,
      useFactory: (auth: AuthService, router: Router, doc: Document) =>
        new AuthInterceptor(auth, router, doc),
      deps: [AuthService, Router, DOCUMENT],
      multi: true
    }
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
