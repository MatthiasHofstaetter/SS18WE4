import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';

import {PasswordClient} from '../rest';

@Injectable()
export class UserService {
  constructor(private readonly restClient: PasswordClient) {
  }

  changePassword(oldPassword: string, newPassword: string): Observable<void> {
    return this.restClient.changePassword({oldPassword, newPassword});
  }
}
