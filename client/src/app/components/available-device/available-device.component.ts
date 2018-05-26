import {AfterViewInit, Component, ElementRef, Input, OnDestroy} from '@angular/core';
import {AvailableDevice} from '../../models';

declare var $: any;

@Component({
  selector: '[app-available-device]',
  templateUrl: './available-device.component.html',
  host: {
    'class': 'device',
    'tabindex': '0',
    '[attr.aria-labelledby]': '"available-title-" + data.type',
    '[attr.title]': 'data.title'
  }
})
export class AvailableDeviceComponent implements AfterViewInit, OnDestroy {
  @Input('data')
  data: AvailableDevice;

  private readonly $el;

  constructor(el: ElementRef) {
    this.$el = $(el.nativeElement);
  }

  ngAfterViewInit() {
    this.$el.data('device', JSON.stringify(this.data));
    this.$el.draggable({
      cursor: 'move',
      containment: 'document',
      revert: 'invalid',
      helper: () => this.$el.find('.device-image').first().clone(),
      zIndex: 50
    });
  }

  ngOnDestroy() {
    this.$el.draggable('destroy');
  }
}
