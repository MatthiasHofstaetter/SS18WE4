import {Component, Input} from '@angular/core';

import {BaseControlComponent} from '../base-control.component';
import {DeviceService} from '../../../services';
import {EnumControl, LogEntry} from '../../../models';
import '../../../models/device.model';

@Component({
  moduleId: module.id,
  selector: 'app-enum-control',
  templateUrl: './enum-control.component.html'
})
export class EnumControlComponent extends BaseControlComponent<number> {
  @Input()
  device: Device<EnumControl>;

  data = [];
  readonly colorScheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
  };

  constructor(deviceService: DeviceService) {
    super(deviceService);
  }

  ngOnInit(): void {
    this.data = this.device.control.values.map(name => {
      return {name: name, value: 0};
    });
    super.ngOnInit();
  }

  onSubmit(): void {
    // Transform string value from html select to a number
    this.value = +this.value;
    super.onSubmit();
  }

  protected addToChart(...entries: LogEntry<number>[]) {
    entries.forEach(entry => this.data[entry.newValue].value++);
    this.data = [...this.data];
  }

  valueToString(value: number): string {
    return this.device.control.values[value];
  }
}
