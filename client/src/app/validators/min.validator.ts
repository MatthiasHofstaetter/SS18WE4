import {Directive, Input} from '@angular/core';
import {NG_VALIDATORS, Validator, Validators, ValidatorFn} from '@angular/forms';

@Directive({
  selector: '[min]',
  providers: [{provide: NG_VALIDATORS, useExisting: MinValidator, multi: true}]
})
export class MinValidator implements Validator {
  @Input()
  min: number;

  get validate(): ValidatorFn {
    return Validators.min(this.min);
  }
}
