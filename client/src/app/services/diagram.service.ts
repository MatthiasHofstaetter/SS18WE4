import {Injectable, NgZone} from '@angular/core';
import {Router} from '@angular/router';
import 'rxjs/add/operator/first';

import {DeviceService} from './device.service';
import '../models/arrow.model';
import '../models/device.model';

@Injectable()
export class DiagramService {
  constructor(private readonly router: Router, private zone: NgZone, private readonly deviceService: DeviceService) {
  }

  initDevices(func: (device: Device<any>) => void): void {
    this.deviceService.getDevices().first().subscribe(devices => devices.forEach(func));
  }

  initArrows(func: (arrow: Arrow) => void): void {
    this.deviceService.getArrows().first().subscribe(arrows => arrows.forEach(func));
  }

  afterDeviceAdd(device: Device<any>): void {
    this.deviceService.addDevice(device);
  }

  afterDeviceDelete(device: Device<any>): void {
    this.deviceService.deleteDevice(device);
  }

  onDeviceDetails(device: Device<any>): void {
    this.zone.run(() => {
      this.router.navigate(['details', device.index]);
    });
  }

  onDeviceMove(device: Device<any>): void {
    this.deviceService.moveDevice(device);
  }

  afterArrowAdd(arrow: Arrow): void {
    this.deviceService.addArrow(arrow);
  }

  afterArrowDelete(arrow: Arrow): void {
    this.deviceService.deleteArrow(arrow);
  }
}
