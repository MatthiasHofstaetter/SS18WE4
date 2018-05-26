import {HttpClient, HttpErrorResponse} from '@angular/common/http';

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/share';

import {environment} from '../../environments/environment';

export abstract class RestClient {
  private readonly baseUrl;

  protected constructor(endpointUrl: string, private readonly httpClient: HttpClient) {
    this.baseUrl = environment.apiEndpoint + endpointUrl;
  }

  protected get<T>(url?: string, params?): Observable<T> {
    return this.request('get', url, params);
  }

  protected post<T>(url: string, body, params?): Observable<T> {
    return this.request('post', url, params, body);
  }

  protected put<T>(url: string, body, params?): Observable<T> {
    return this.request('put', url, params, body);
  }

  protected patch<T>(url: string, body, params?): Observable<T> {
    return this.request('patch', url, params, body);
  }

  protected delete<T>(url: string, params?): Observable<T> {
    return this.request('delete', url, params);
  }

  private request<T>(method: string, url?: string, params?, body?): Observable<T> {
    const fullUrl = url ? this.baseUrl + url : this.baseUrl;
    return this.httpClient
      .request<T>(method, fullUrl, {body, params})
      .share()
      .catch((response: HttpErrorResponse) => {
        console.log(`Request to ${fullUrl} failed:`, response);
        return Observable.throw(response.status && response.error ? response.error : response);
      });
  }
}
