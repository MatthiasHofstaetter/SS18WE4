import {Directive, Input} from '@angular/core';
import {NG_VALIDATORS, Validator, Validators, ValidatorFn} from '@angular/forms';

@Directive({
  selector: '[max]',
  providers: [{provide: NG_VALIDATORS, useExisting: MaxValidator, multi: true}]
})
export class MaxValidator implements Validator {
  @Input()
  max: number;

  get validate(): ValidatorFn {
    return Validators.max(this.max);
  }
}
