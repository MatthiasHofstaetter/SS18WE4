import {Component, OnDestroy} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

import {Subscription} from 'rxjs/Subscription';
import 'rxjs/add/operator/switchMap';

import {ControlType} from '../../models';
import {DeviceService} from '../../services';
import '../../models/device.model';

@Component({
  moduleId: module.id,
  selector: 'app-device-detail',
  templateUrl: './device-details.component.html'
})

export class DeviceDetailsComponent implements OnDestroy {
  device: Device<any> = null;

  readonly ControlType = ControlType;
  readonly subscription: Subscription;

  constructor(private deviceService: DeviceService, private router: Router, private route: ActivatedRoute) {
    this.subscription = this.route.params
      .switchMap(params => this.deviceService.getDevice(+params['id']))
      .subscribe(device => this.device = device);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
