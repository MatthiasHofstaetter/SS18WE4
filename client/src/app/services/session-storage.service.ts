import {Injectable} from '@angular/core';

@Injectable()
export class SessionStorageService {
  private _loggedIn: boolean;
  private jsonToken: string;

  constructor() {
    this._loggedIn = !!localStorage.getItem('loggedIn');
  }

  get loggedIn(): boolean {
    return this._loggedIn;
  }

  setLoggedIn(loggedIn: boolean): void {
    this._loggedIn = loggedIn;
    if (loggedIn) {
      localStorage.setItem('loggedIn', 'true');
    } else {
      localStorage.removeItem('loggedIn');
    }
  }

  setJWT(token : string){
    this.jsonToken = token;
    localStorage.setItem('token',this.jsonToken);
    console.log("token "+ this.jsonToken+" was set");
  }

  getJWt():String{
    return localStorage.getItem('token');
  }

   jwtExpired():boolean{
    this.jsonToken = localStorage.getItem('token');

    if(this.jsonToken==='null')
      return true;

    if(this.jsonToken!='null')
    {
      var payloadEncoded = this.jsonToken.split(".")[1];
      var payloadDecodedJson = JSON.parse(atob(payloadEncoded)); //parse decoded payload string in json object
      var current_time = new Date().getTime() / 1000;
      if (current_time > payloadDecodedJson.exp) 
      {
        console.log("token: "+this.jsonToken+" is expired.");
        return true;
      }
      else
      {
        console.log("token: "+this.jsonToken+" is still valid.");
      }
    }
    return false;
  }
}
