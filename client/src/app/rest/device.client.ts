import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';

import {RestClient} from './rest.client';
import {AvailableDevice, RestDevice} from '../models';

@Injectable()
export class DeviceClient extends RestClient {
  constructor(httpClient: HttpClient) {
    super('/devices', httpClient);
  }

  public getAvailable(): Observable<AvailableDevice[]> {
    return this.get('/available');
  }

  public getDevices(): Observable<RestDevice<any>[]> {
    return this.get(null);
  }

  public addDevice(device: RestDevice<any>) {
    return this.post(null, device);
  }

  public moveDevice(device: Device<any>) {
    return this.patch(`/${device.index}`, {position: device.getPosition()});
  }

  public deleteDevice(device: Device<any>) {
    return this.delete(`/${device.index}`);
  }

  public addArrow(arrow: Arrow) {
    return this.post(`/${arrow.startDevice.index}/successors`, {index: arrow.endDevice.index});
  }

  public deleteArrow(arrow: Arrow) {
    return this.delete(`/${arrow.startDevice.index}/successors/${arrow.endDevice.index}`);
  }
}
