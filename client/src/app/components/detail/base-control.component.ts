import {OnDestroy, OnInit} from '@angular/core';

import {DeviceService} from '../../services';
import {Control, LogEntry} from '../../models';
import '../../models/device.model';
import {Subscription} from 'rxjs/Subscription';

export abstract class BaseControlComponent<T> implements OnInit, OnDestroy {
  abstract device: Device<Control<T>>;
  value: T;
  log: string;

  private subscription: Subscription;

  protected constructor(private readonly deviceService: DeviceService) {
  }

  ngOnInit(): void {
    this.value = this.device.control.current;
    this.log = this.device.control.log.map(entry => this.formatLogEntry(entry)).join('');
    this.addToChart(...this.device.control.log);

    this.subscription = this.deviceService.getLogUpdates().subscribe(update => {
      if (update.device === this.device) {
        this.log += this.formatLogEntry(update.logEntry);
        this.addToChart(update.logEntry);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  }

  onSubmit(): void {
    this.deviceService.updateDevice(this.device, this.value);
  }

  private formatLogEntry(entry: LogEntry<T>): string {
    return `${entry.date.toLocaleString()}: ${this.valueToString(entry.oldValue)} -> ${this.valueToString(entry.newValue)}\n`;
  }

  protected abstract addToChart(...entries: LogEntry<T>[]);

  protected abstract valueToString(value: T): string;
}
