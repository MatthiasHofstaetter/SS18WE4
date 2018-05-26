import './device.model';

declare global {
  class Arrow {
    readonly startDevice: Device<any>;
    endDevice: Device<any> | null;

    constructor(startDevice: Device<any>, endDevice?: Device<any>);
  }
}

export {};
