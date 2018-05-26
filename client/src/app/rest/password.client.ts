import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';

import {RestClient} from './rest.client';
import {PasswordChangeRequest} from '../models';

@Injectable()
export class PasswordClient extends RestClient {
  constructor(httpClient: HttpClient) {
    super('/password', httpClient);
  }

  public changePassword(changeRequest: PasswordChangeRequest): Observable<void> {
    return this.put(null, changeRequest);
  }
}
