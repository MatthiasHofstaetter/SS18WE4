import {Directive, Input, OnDestroy} from '@angular/core';
import {NG_VALIDATORS, AbstractControl, ValidationErrors, Validator} from '@angular/forms';
import {Subscription} from 'rxjs/Subscription';

@Directive({
  selector: '[confirm]',
  providers: [{provide: NG_VALIDATORS, useExisting: ConfirmValidator, multi: true}]
})
export class ConfirmValidator implements Validator, OnDestroy {
  @Input('confirm')
  original: AbstractControl;

  private subscription: Subscription = null;

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  }

  validate(confirmation: AbstractControl): ValidationErrors | null {
    if (!this.subscription) {
      // When validating for the first time add a listener for updating the validation every time the original value changes
      this.subscription = this.original.valueChanges.subscribe(() => confirmation.updateValueAndValidity());
    }

    return confirmation.value === this.original.value ? null : {
      confirm: true
    };
  }
}
