import {Component} from '@angular/core';
import {Observable} from 'rxjs/Observable';

import {AvailableDevice} from 'app/models/device.available';
import {DeviceService} from '../../services';

@Component({
  templateUrl: './overview.component.html'
})
export class OverviewComponent {
  constructor(private readonly deviceService: DeviceService) {
  }

  get deviceCount(): Observable<number> {
    return this.deviceService.getDeviceCount();
  }

  get arrowCount(): Observable<number> {
    return this.deviceService.getArrowCount();
  }

  get available(): Observable<AvailableDevice[]> {
    return this.deviceService.getAvailable();
  }
}
