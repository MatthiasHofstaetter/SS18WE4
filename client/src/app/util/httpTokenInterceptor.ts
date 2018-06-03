import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { SessionStorageService } from '../services';
import { Router } from '@angular/router';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(public sessionStorageService:SessionStorageService,private readonly router: Router) {}
  
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${this.sessionStorageService.getJWt()}`
      }
    });
    return next.handle(request).catch(this.handleError);
  }

  public handleError = (error) => { 
      
      let errorMessage = error.error.message;
      console.log("error occured interceptor: "+errorMessage);
      if(errorMessage==='token invalid')
      {
        console.log("route to login...");
        this.router.navigate(['/login']);
      }
      return Observable.throw(error)
  }
}