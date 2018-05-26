import {Component, Input} from '@angular/core';

import {BaseControlComponent} from '../base-control.component';
import {DeviceService} from '../../../services';
import {BooleanControl, LogEntry} from '../../../models';
import '../../../models/device.model';

@Component({
  moduleId: module.id,
  selector: 'app-boolean-control',
  templateUrl: './boolean-control.component.html'
})
export class BooleanControlComponent extends BaseControlComponent<boolean> {
  @Input()
  device: Device<BooleanControl>;

  data = [{
    'name': 'Aus',
    'value': 0
  }, {
    'name': 'An',
    'value': 0
  }];

  readonly colorScheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
  };

  constructor(deviceService: DeviceService) {
    super(deviceService);
  }

  protected addToChart(...entries: LogEntry<boolean>[]) {
    entries.forEach(entry => this.data[entry.newValue ? 1 : 0].value++);
    this.data = [...this.data];
  }

  valueToString(value: boolean): string {
    return value ? 'An' : 'Aus';
  }
}
