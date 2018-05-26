import {Component} from '@angular/core';
import {NgForm} from '@angular/forms';

import {UserService} from '../../services';

@Component({
  templateUrl: './options.component.html'
})
export class OptionsComponent {
  success = false;
  errorMessage: string = null;
  serverErrors: any = {};

  constructor(private readonly userService: UserService) {
  }

  public changePassword(form: NgForm): void {
    this.userService.changePassword(form.value.oldPassword, form.value.newPassword)
      .subscribe(() => {
        form.resetForm();
        this.success = true;
        this.errorMessage = null;
        this.serverErrors = null;
      }, response => {
        this.success = false;
        this.errorMessage = response.message;
        this.serverErrors = response.errors || null;
      });
  }
}
