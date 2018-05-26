import {Component, Input} from '@angular/core';

import {BaseControlComponent} from '../base-control.component';
import {DeviceService} from '../../../services';
import {ContinuousControl, LogEntry} from '../../../models';
import '../../../models/device.model';

@Component({
  moduleId: module.id,
  selector: 'app-continuous-control',
  templateUrl: './continuous-control.component.html'
})
export class ContinuousControlComponent extends BaseControlComponent<number> {
  @Input()
  device: Device<ContinuousControl>;

  data = [{
    name: '',
    series: [{name: new Date().toLocaleString(), value: 0}]
  }];
  xAxisLabel = 'Zeit';
  yAxisLabel = '';
  readonly colorScheme = {
    domain: ['#333333', '#AAAAAA']
  };

  constructor(deviceService: DeviceService) {
    super(deviceService);
  }

  ngOnInit(): void {
    this.data[0].name = this.device.control.yLabel;
    this.yAxisLabel = this.device.control.yLabel;
    super.ngOnInit();
  }

  protected addToChart(...entries: LogEntry<number>[]) {
    entries.forEach(entry => this.data[0].series.push({'name': entry.date.toLocaleString(), 'value': entry.newValue}));
    this.data = [...this.data];
  }

  protected valueToString(value: number): string {
    return value.toString();
  }
}
